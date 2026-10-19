import { createHmac, sign } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { boundedJson, publicSnapshot } from '../src/lib/public-monitor.mjs';

const iso = value => new Date(value).toISOString().replace(/\.\d{3}Z$/, 'Z');
const count = value => Number.isSafeInteger(value) && value >= 0;

// Project the deployed Dashboard overview, never instantiate its model or read collector files.
export function sanitizeDashboard(source, aliasKey, now = Date.now()) {
  if (source?.schema_version !== 'collector-dashboard-v1' || source.read_only !== true ||
      typeof source.run?.run_id !== 'string' || !source.run.run_id || source.run.run_id.length > 512 || typeof aliasKey !== 'string' || aliasKey.length < 32) throw new Error('Unsupported source');
  const l2 = source.l2_lanes, raw = source.v2_observation?.raw_landing;
  const trades = raw?.state === 'AVAILABLE' ? raw.products?.filter(p => ['TRADE', 'OPTION_TRADE'].includes(p.product)) : source.trade_lanes;
  const validRows = rows => Array.isArray(rows) && rows.length > 0 && rows.length <= 32 && rows.every(row => count(row.persisted));
  if (!validRows(l2) || !validRows(trades) || !l2.every(lane => count(lane.sequence_mismatches))) throw new Error('Persisted counters unavailable');
  const observed = Date.parse(source.freshness?.collector_process?.timestamp);
  if (!Number.isFinite(observed) || now - observed > 90_000 || observed > now + 15_000) throw new Error('Source observations stale');
  const active = source.active_run, status = source.run.status;
  const state = source.service_state === 'STOPPED' ? 'stopped' : active?.run_id === source.run.run_id && source.service_state === 'ONLINE' && source.freshness.collector_process.state === 'FRESH'
    ? status === 'FINALIZING' ? 'draining' : 'collecting' : null;
  if (!state) throw new Error('Collector state unconfirmed');
  const elapsed = (active ?? source.last_run)?.elapsed_ms;
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new Error('Run start unconfirmed');
  const sum = (lanes, key) => lanes.reduce((total, lane) => total + lane[key], 0);
  // This provisional time accommodates source clock skew; ingestion assigns the public publication time.
  return publicSnapshot({ schemaVersion: 1, mode: 'observed', preparedAt: iso(Math.max(now, observed)), observedAt: iso(observed),
    runId: `public-${createHmac('sha256', aliasKey).update(source.run.run_id).digest('hex').slice(0, 20)}`,
    collectorState: state, elapsedSeconds: Math.floor(elapsed / 1000), tradesPersisted: sum(trades, 'persisted'),
    l2Persisted: sum(l2, 'persisted'), sequenceErrors: sum(l2, 'sequence_mismatches'),
    campaignResult: source.run.readiness_result === 'PASS' ? 'passed' : ['FAIL', 'FAILED'].includes(source.run.readiness_result) ? 'failed' : active ? 'pending' : 'not_published',
    lastRunSummary: 'Operational observations mirror the Dashboard. Research findings remain separate.' });
}

export async function publishOnce(env = process.env, transport = fetch) {
  if (env.PUBLIC_PUBLISH_ENABLED !== 'true') return { state: 'disabled', requests: 0 };
  const source = new URL(env.PUBLIC_SOURCE_URL), target = new URL(env.PUBLIC_INGEST_URL);
  if (source.protocol !== 'https:' || !source.hostname.endsWith('.ts.net') || source.port || source.pathname !== '/api/collector' || source.search || source.username || source.password ||
      target.protocol !== 'https:' || target.pathname !== '/ingest' || target.search || target.username || target.password ||
      typeof env.PUBLIC_SIGNING_KEY !== 'string' || !env.PUBLIC_SIGNING_KEY.includes('PRIVATE KEY')) throw new Error('Exporter configuration invalid');
  const observation = await transport(source, { signal: AbortSignal.timeout(5000), redirect: 'error', credentials: 'omit' });
  if (!observation.ok) throw new Error('Source unavailable');
  const data = sanitizeDashboard(await boundedJson(observation, 2097152), env.PUBLIC_ALIAS_KEY);
  const body = JSON.stringify(data), signature = sign(null, Buffer.from(body), env.PUBLIC_SIGNING_KEY).toString('base64');
  const result = await transport(target, { method: 'POST', signal: AbortSignal.timeout(5000), redirect: 'error', credentials: 'omit',
    headers: { 'Content-Type': 'application/json', Authorization: `Signature ${signature}` }, body });
  await result.body?.cancel();
  if (result.status !== 202) throw new Error('Publication rejected');
  return { state: 'published', requests: 2, observation: data };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  let stopping = false, timer;
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { stopping = true; clearTimeout(timer); });
  async function cycle() {
    if (stopping) return;
    try {
      const configIndex = process.argv.indexOf('--config');
      let env = process.env;
      if (configIndex !== -1) {
        const bytes = readFileSync(process.argv[configIndex + 1]);
        if (bytes.length > 4096) throw Error('Configuration limit');
        env = JSON.parse(bytes.toString('utf8'));
      }
      const result = await publishOnce(env);
      if (process.argv.includes('--once')) { console.log(JSON.stringify(result)); return; }
      if (result.state === 'disabled') return;
    }
    catch { console.error('PUBLIC_PUBLICATION_UNAVAILABLE'); if (process.argv.includes('--once')) process.exitCode = 1; }
    // No queue, overlap or immediate retry; at most two bounded requests per cycle.
    if (!stopping && !process.argv.includes('--once')) timer = setTimeout(cycle, 60_000);
  }
  void cycle();
}
