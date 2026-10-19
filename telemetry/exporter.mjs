import { createHmac } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { boundedJson, publicSnapshot } from '../src/lib/public-monitor.mjs';

const iso = value => new Date(value).toISOString().replace(/\.\d{3}Z$/, 'Z');
const count = value => Number.isSafeInteger(value) && value >= 0;

// Reads an existing dashboard projection only; no collector imports or filesystem access.
export function sanitizeDashboard(source, aliasKey, now = Date.now()) {
  if (!['microstructure-dashboard-v1', 'collector-dashboard-v1'].includes(source?.schema_version) || source.read_only !== true ||
      typeof source.run?.run_id !== 'string' || !source.run.run_id || source.run.run_id.length > 512 || typeof aliasKey !== 'string' || aliasKey.length < 32) throw new Error('Unsupported source');
  const l2 = source.l2_lanes, trades = source.trade_lanes;
  const expected = new Set(['binance', 'okx', 'bybit'].flatMap(venue => ['BTCUSDT', 'ETHUSDT'].map(symbol => `${venue}|${symbol}`)));
  const lanesValid = lanes => Array.isArray(lanes) && lanes.length === 6 && new Set(lanes.map(lane => `${lane.venue}|${lane.symbol}`)).size === 6 && lanes.every(lane => expected.has(`${lane.venue}|${lane.symbol}`) && count(lane.persisted));
  if (!lanesValid(l2) || !lanesValid(trades) || !l2.every(lane => count(lane.sequence_mismatches))) throw new Error('Persisted counters unavailable');
  const observed = Math.min(Date.parse(source.sources?.telemetry?.captured_at), Date.parse(source.sources?.status?.captured_at));
  if (!Number.isFinite(observed) || now - observed > 90_000 || observed > now + 15_000) throw new Error('Source observations stale');
  const status = source.run.status;
  const state = source.service_state === 'STOPPED' ? 'stopped' : status === 'RUNNING' ? 'collecting' : status === 'FINALIZING' ? 'draining' : ['COMPLETED', 'FAILED', 'CAPTURE_FAILED'].includes(status) ? 'stopped' : null;
  if (!state) throw new Error('Collector state unconfirmed');
  const elapsed = observed - Date.parse(source.run.start);
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new Error('Run start unconfirmed');
  const sum = (lanes, key) => lanes.reduce((total, lane) => total + lane[key], 0);
  return publicSnapshot({ schemaVersion: 1, mode: 'live', preparedAt: iso(now), observedAt: iso(observed),
    runId: `public-${createHmac('sha256', aliasKey).update(source.run.run_id).digest('hex').slice(0, 20)}`,
    collectorState: state, elapsedSeconds: Math.floor(elapsed / 1000), tradesPersisted: sum(trades, 'persisted'),
    l2Persisted: sum(l2, 'persisted'), sequenceErrors: sum(l2, 'sequence_mismatches'),
    campaignResult: ['FAILED', 'CAPTURE_FAILED'].includes(status) ? 'failed' : 'not_published',
    lastRunSummary: 'No retained research finding is published for this run.' });
}

export async function publishOnce(env = process.env, transport = fetch) {
  if (env.PUBLIC_PUBLISH_ENABLED !== 'true') return { state: 'disabled', requests: 0 };
  const source = new URL(env.PUBLIC_SOURCE_URL), target = new URL(env.PUBLIC_INGEST_URL);
  if (source.origin !== 'http://127.0.0.1:8787' || !['/api/collector', '/api/dashboard'].includes(source.pathname) || source.search || source.username || source.password ||
      target.protocol !== 'https:' || target.pathname !== '/ingest' || target.search || target.username || target.password ||
      typeof env.PUBLIC_PUBLISH_TOKEN !== 'string' || env.PUBLIC_PUBLISH_TOKEN.length < 32) throw new Error('Exporter configuration invalid');
  const observation = await transport(source, { signal: AbortSignal.timeout(5000), redirect: 'error', credentials: 'omit' });
  if (!observation.ok) throw new Error('Source unavailable');
  const data = sanitizeDashboard(await boundedJson(observation, 262144), env.PUBLIC_ALIAS_KEY);
  const result = await transport(target, { method: 'POST', signal: AbortSignal.timeout(5000), redirect: 'error', credentials: 'omit',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.PUBLIC_PUBLISH_TOKEN}` }, body: JSON.stringify(data) });
  await result.body?.cancel();
  if (result.status !== 202) throw new Error('Publication rejected');
  return { state: 'published', requests: 2 };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  let stopping = false;
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { stopping = true; });
  async function cycle() {
    if (stopping) return;
    try { const result = await publishOnce(); if (result.state === 'disabled') return; }
    catch { console.error('PUBLIC_PUBLICATION_UNAVAILABLE'); }
    // No queue, overlap or immediate retry; at most two bounded requests per cycle.
    if (!stopping) setTimeout(cycle, 60_000);
  }
  void cycle();
}
