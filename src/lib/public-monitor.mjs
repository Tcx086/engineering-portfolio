/** @typedef {{schemaVersion: number, mode: 'snapshot'|'live', preparedAt: string, observedAt: string|null, runId: string|null, collectorState: string, elapsedSeconds: number|null, tradesPersisted: number|null, l2Persisted: number|null, sequenceErrors: number|null, campaignResult: string, lastRunSummary: string}} PublicSnapshot */
const keys = ['schemaVersion', 'mode', 'preparedAt', 'observedAt', 'runId', 'collectorState', 'elapsedSeconds', 'tradesPersisted', 'l2Persisted', 'sequenceErrors', 'campaignResult', 'lastRunSummary'];
const states = { not_published: 'Not published', collecting: 'Collecting', draining: 'Finishing storage', stopped: 'Stopped', unavailable: 'Unavailable' };
const results = { not_published: 'Not published', pending: 'In progress', passed: 'Passed published checks', failed: 'Failed published checks' };
const counters = ['elapsedSeconds', 'tradesPersisted', 'l2Persisted', 'sequenceErrors'];
/** @param {unknown} value @param {number} [now] @returns {value is PublicSnapshot} */
export function isPublicSnapshot(value, now = Date.now()) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = /** @type {Record<string, unknown>} */ (value);
  const timestamp = (/** @type {unknown} */ date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().replace('.000Z', 'Z') === date && Date.parse(date) <= now + 15_000;
  if (Object.keys(data).length !== keys.length || !keys.every(key => Object.hasOwn(data, key))) return false;
  if (data.schemaVersion !== 1 || typeof data.mode !== 'string' || !['snapshot', 'live'].includes(data.mode) || !timestamp(data.preparedAt)) return false;
  if (data.observedAt !== null && !timestamp(data.observedAt)) return false;
  if (data.runId !== null && (typeof data.runId !== 'string' || !/^public-[a-z0-9-]{1,40}$/.test(data.runId))) return false;
  if (typeof data.collectorState !== 'string' || typeof data.campaignResult !== 'string' || !Object.hasOwn(states, data.collectorState) || !Object.hasOwn(results, data.campaignResult)) return false;
  if (!counters.every(key => data[key] === null || (Number.isSafeInteger(data[key]) && Number(data[key]) >= 0))) return false;
  if (typeof data.lastRunSummary !== 'string' || data.lastRunSummary.length > 320 || !/^[\x20-\x7E]+$/.test(data.lastRunSummary)) return false;
  if (/https?:|[\\@<>]|\b\d{1,3}(?:\.\d{1,3}){3}\b|token|secret|password|private key|localhost|\b[A-Z]:|(?:^|\s)\/[a-z]/i.test(data.lastRunSummary)) return false;
  if (data.mode === 'live' && (!data.observedAt || !data.runId || data.collectorState === 'not_published')) return false;
  return true;
}
/** @param {unknown} value */
export function publicSnapshot(value) {
  if (!isPublicSnapshot(value)) throw new Error('Snapshot must pass the public field allowlist');
  return value;
}
export const monitorFields = [
  ['runId', 'Public run ID'], ['collectorState', 'Collector state'], ['elapsedSeconds', 'Elapsed time'],
  ['tradesPersisted', 'Trades persisted'], ['l2Persisted', 'L2 updates persisted'], ['sequenceErrors', 'Sequence errors'],
  ['campaignResult', 'Campaign result'], ['observedAt', 'Last observation']
];
/** @param {PublicSnapshot} data @param {string} key */
export function monitorValue(data, key) {
  const value = data[/** @type {keyof PublicSnapshot} */ (key)];
  if (value == null) return 'Not published';
  if (key === 'collectorState') return states[/** @type {keyof typeof states} */ (value)];
  if (key === 'campaignResult') return results[/** @type {keyof typeof results} */ (value)];
  if (key === 'observedAt') return publicTime(String(value));
  if (key === 'elapsedSeconds') { const seconds = Number(value); return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`; }
  return typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
}
/** @param {string} value */
export function publicTime(value) { return value.replace('T', ' ').replace('Z', ' UTC'); }
/** @param {PublicSnapshot} data @param {number} [now] */
export function monitorStatus(data, now = Date.now()) {
  if (data.mode === 'snapshot') return 'Snapshot only';
  return data.observedAt && now - Date.parse(data.observedAt) <= 120_000 ? 'Live public data' : 'Delayed public data';
}
/** @param {PublicSnapshot} data */
export function monitorDescription(data) {
  return data.mode === 'live' ? 'The latest approved collector observation, published through a read-only public artifact. Values describe the observation time shown below.' : 'The live collector feed is not connected. This view retains the approved findings; current run values remain unpublished.';
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-public-monitor]');
  if (root) {
    const badge = root.querySelector('[data-monitor-status]');
    const summary = root.querySelector('[data-monitor-summary]');
    const prepared = root.querySelector('[data-monitor-prepared]');
    const description = root.querySelector('[data-monitor-description]');
    const telemetry = root.querySelector('details');
    let busy = false;
    /** @type {AbortController | undefined} */ let controller;
    async function refresh() {
      if (document.hidden || busy) return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 5000);
      try {
        const response = await fetch('/monitoring/collector-public.json', { cache: 'no-cache', credentials: 'omit', mode: 'same-origin', redirect: 'error', signal: controller.signal });
        if (!response.ok || Number(response.headers.get('content-length')) > 4096) throw new Error('Unavailable');
        const text = await response.text();
        if (text.length > 4096) throw new Error('Oversized snapshot');
        const data = publicSnapshot(JSON.parse(text));
        root?.querySelectorAll('[data-monitor-field]').forEach(node => { node.textContent = monitorValue(data, node.getAttribute('data-monitor-field') || ''); });
        if (badge) badge.textContent = monitorStatus(data);
        if (summary) summary.textContent = data.lastRunSummary;
        if (prepared) { prepared.textContent = publicTime(data.preparedAt); prepared.setAttribute('datetime', data.preparedAt); }
        if (description) description.textContent = monitorDescription(data);
        root?.setAttribute('data-status', monitorStatus(data) === 'Live public data' ? 'live' : 'snapshot');
        if (telemetry instanceof HTMLDetailsElement && data.mode === 'live') telemetry.open = true;
      } catch {
        if (badge) badge.textContent = 'Refresh unavailable · data retained';
        root?.setAttribute('data-status', 'snapshot');
      } finally { clearTimeout(timeout); busy = false; }
    }
    void refresh();
    setInterval(() => { void refresh(); }, 30_000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void refresh(); });
    window.addEventListener('pagehide', () => { controller?.abort(); });
  }
}
