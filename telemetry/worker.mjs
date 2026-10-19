import { timingSafeEqual } from 'node:crypto';
import { publicSnapshot, boundedJson, forwardObservation } from '../src/lib/public-monitor.mjs';

export const READ_SQL = 'SELECT payload FROM public_observation WHERE id = 1';
export const WRITE_SQL = `INSERT INTO public_observation (id, observed_at, published_at, run_alias, payload)
VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET observed_at=excluded.observed_at,
published_at=excluded.published_at, run_alias=excluded.run_alias, payload=excluded.payload
WHERE excluded.observed_at > public_observation.observed_at
AND unixepoch(excluded.published_at) - unixepoch(public_observation.published_at) >= 30
AND (excluded.run_alias != public_observation.run_alias OR (
json_extract(excluded.payload, '$.tradesPersisted') >= json_extract(public_observation.payload, '$.tradesPersisted')
AND json_extract(excluded.payload, '$.l2Persisted') >= json_extract(public_observation.payload, '$.l2Persisted')
AND json_extract(excluded.payload, '$.sequenceErrors') >= json_extract(public_observation.payload, '$.sequenceErrors')
AND json_extract(excluded.payload, '$.elapsedSeconds') >= json_extract(public_observation.payload, '$.elapsedSeconds')))`;

function authorized(request, secret) {
  const value = request.headers.get('authorization') ?? '';
  if (typeof secret !== 'string' || secret.length < 32 || value.length !== secret.length + 7) return false;
  const received = new TextEncoder().encode(value), expected = new TextEncoder().encode(`Bearer ${secret}`);
  return received.byteLength === expected.byteLength && timingSafeEqual(received, expected);
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const reply = (status, body) => new Response(request.method === 'HEAD' ? null : JSON.stringify(body), { status, headers: {
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Access-Control-Allow-Origin': 'https://portfolio.tcx086.com', 'Referrer-Policy': 'no-referrer'
    } });
    if (!['/public/collector', '/ingest'].includes(path) || new URL(request.url).search) return reply(404, { error: 'Not found' });
    if (path === '/public/collector' && !['GET', 'HEAD'].includes(request.method)) return reply(405, { error: 'Read only' });
    if (path === '/ingest' && request.method !== 'POST') return reply(405, { error: 'Method not allowed' });
    try {
      const limiter = path === '/ingest' ? env.WRITE_LIMIT : env.READ_LIMIT;
      if (!(await limiter.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' })).success) return reply(429, { error: 'Rate limited' });
      if (path === '/public/collector') {
        const row = await env.DB.prepare(READ_SQL).first();
        if (!row) return reply(503, { error: 'No public observation published' });
        const data = publicSnapshot(JSON.parse(row.payload));
        if (data.mode === 'live' && env.LIVE_VERIFIED !== 'true') return reply(503, { error: 'Live integration unverified' });
        return reply(200, data);
      }
      if (!authorized(request, env.PUBLISH_TOKEN)) return reply(401, { error: 'Unauthorized' });
      if (env.PUBLISH_ENABLED !== 'true') return reply(503, { error: 'Publisher disabled' });
      if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return reply(415, { error: 'JSON required' });
      let data;
      try { data = publicSnapshot(await boundedJson(request, 4096)); } catch { return reply(400, { error: 'Invalid public observation' }); }
      if (data.mode === 'snapshot' || !['elapsedSeconds', 'tradesPersisted', 'l2Persisted', 'sequenceErrors'].every(key => data[key] !== null)) return reply(400, { error: 'Complete observed counters required' });
      if (data.mode === 'live' && env.LIVE_VERIFIED !== 'true') return reply(409, { error: 'Live integration unverified' });
      const now = Date.now();
      if (now - Date.parse(data.observedAt) > 90_000 || Date.parse(data.observedAt) > now) return reply(400, { error: 'Observation outside accepted window' });
      const prior = await env.DB.prepare(READ_SQL).first();
      if (prior && !forwardObservation(publicSnapshot(JSON.parse(prior.payload)), data)) return reply(409, { error: 'Observation must advance' });
      data.preparedAt = new Date(now).toISOString().replace(/\.\d{3}Z$/, 'Z');
      const result = await env.DB.prepare(WRITE_SQL).bind(data.observedAt, data.preparedAt, data.runId, JSON.stringify(data)).run();
      return result.meta.changes ? reply(202, { accepted: true }) : reply(409, { error: 'Observation must advance; minimum write interval 30 seconds' });
    } catch { return reply(503, { error: 'Public telemetry unavailable' }); }
  }
};
