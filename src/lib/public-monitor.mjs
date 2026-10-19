/** @typedef {{schemaVersion: number, mode: 'snapshot'|'live'|'observed'|'synthetic', preparedAt: string, observedAt: string|null, runId: string|null, collectorState: string, elapsedSeconds: number|null, tradesPersisted: number|null, l2Persisted: number|null, sequenceErrors: number|null, campaignResult: string, lastRunSummary: string}} PublicSnapshot */
export const FRESHNESS_MS = 180_000;
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
  if (data.schemaVersion !== 1 || typeof data.mode !== 'string' || !['snapshot', 'live', 'observed', 'synthetic'].includes(data.mode) || !timestamp(data.preparedAt)) return false;
  if (data.observedAt !== null && !timestamp(data.observedAt)) return false;
  if (data.observedAt && Date.parse(String(data.observedAt)) > Date.parse(String(data.preparedAt))) return false;
  if (data.runId !== null && (typeof data.runId !== 'string' || !/^public-[a-z0-9-]{1,40}$/.test(data.runId))) return false;
  if (typeof data.collectorState !== 'string' || typeof data.campaignResult !== 'string' || !Object.hasOwn(states, data.collectorState) || !Object.hasOwn(results, data.campaignResult)) return false;
  if (!counters.every(key => data[key] === null || (Number.isSafeInteger(data[key]) && Number(data[key]) >= 0))) return false;
  if (typeof data.lastRunSummary !== 'string' || data.lastRunSummary.length > 320 || !/^[\x20-\x7E]+$/.test(data.lastRunSummary)) return false;
  if (/https?:|[\\@<>]|\b\d{1,3}(?:\.\d{1,3}){3}\b|token|secret|password|private key|localhost|\b[A-Z]:|(?:^|\s)\/[a-z]/i.test(data.lastRunSummary)) return false;
  if (data.mode !== 'snapshot' && (!data.observedAt || !data.runId || data.collectorState === 'not_published')) return false;
  if (data.mode === 'synthetic' && !String(data.runId).startsWith('public-test-')) return false;
  return true;
}
/** @param {unknown} value */
export function publicSnapshot(value) {
  if (!isPublicSnapshot(value)) throw new Error('Snapshot must pass the public field allowlist');
  return value;
}
export const monitorFields = [
  ['runId', 'Public run ID'], ['collectorState', 'Collector state'], ['elapsedSeconds', 'Elapsed time'],
  ['tradesPersisted', 'Trades persisted'], ['l2Persisted', 'L2 updates persisted'], ['sequenceErrors', 'Reported L2 sequence errors'],
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
  if (data.mode === 'synthetic') return now - Date.parse(data.observedAt || '') > FRESHNESS_MS ? 'Synthetic test data · STALE / DATA DELAYED' : 'Synthetic test data · NOT LIVE';
  if (!data.observedAt || now - Date.parse(data.observedAt) > FRESHNESS_MS) return 'STALE / DATA DELAYED';
  if (data.mode === 'observed') return 'Observed · live verification pending';
  if (data.collectorState === 'stopped') return 'STOPPED';
  return data.collectorState === 'collecting' ? 'COLLECTING · LIVE' : monitorValue(data, 'collectorState').toUpperCase();
}
/** @param {PublicSnapshot} data */
export function monitorDescription(data) {
  if (data.mode === 'synthetic') return 'Labeled synthetic fixtures exercise the publication path. These values are not collector observations.';
  return ['live', 'observed'].includes(data.mode) ? 'Read-only Dashboard observations. Trades include option trades; totals can stay unchanged between durable writes. Elapsed time stays at the observation shown. L2 sequence errors are reported counters, not dataset certification.' : 'Live integration unverified. Current run values remain unpublished. The documented research capture is separate below.';
}

/** @param {Request|Response} message @param {number} limit */
export async function boundedJson(message, limit) {
  if (Number(message.headers.get('content-length')) > limit || !message.body) throw new Error('Body limit');
  const reader = message.body.getReader(), chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) throw new Error('Body limit');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel(); throw error; }
  finally { reader.releaseLock(); }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
}

/** @param {PublicSnapshot} previous @param {PublicSnapshot} next */
export function forwardObservation(previous, next) {
  if (previous.mode === 'snapshot') return true;
  if (next.mode === 'snapshot' || (previous.observedAt && next.observedAt && next.observedAt < previous.observedAt)) return false;
  return next.runId !== previous.runId || counters.every(key => {
    const before = previous[/** @type {keyof PublicSnapshot} */ (key)], after = next[/** @type {keyof PublicSnapshot} */ (key)];
    return before == null || (typeof after === 'number' && after >= Number(before));
  });
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-public-monitor]');
  if (root) {
    const badge = root.querySelector('[data-monitor-status]');
    const summary = root.querySelector('[data-monitor-summary]');
    const prepared = root.querySelector('[data-monitor-prepared]');
    const description = root.querySelector('[data-monitor-description]');
    const telemetry = root.querySelector('details');
    let last = publicSnapshot(JSON.parse(root.getAttribute('data-monitor-fallback') || '{}'));
    let unavailable = false;
    let busy = false;
    /** @type {AbortController | undefined} */ let controller;
    async function refresh() {
      if (document.hidden || busy) return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 5000);
      try {
        const response = await fetch('/api/collector-public/', { cache: 'no-cache', credentials: 'omit', mode: 'same-origin', redirect: 'error', signal: controller.signal });
        if (!response.ok || Number(response.headers.get('content-length')) > 4096) throw new Error('Unavailable');
        const data = publicSnapshot(await boundedJson(response, 4096));
        if (!forwardObservation(last, data)) throw new Error('Regressive observation');
        last = data; unavailable = false;
        root?.querySelectorAll('[data-monitor-field]').forEach(node => {
          const value = monitorValue(data, node.getAttribute('data-monitor-field') || '');
          if (node.textContent !== value) {
            node.textContent = value;
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches) node.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 250 });
          }
        });
        if (summary) summary.textContent = data.lastRunSummary;
        if (prepared) { prepared.textContent = publicTime(data.preparedAt); prepared.setAttribute('datetime', data.preparedAt); }
        if (description) description.textContent = monitorDescription(data);
        if (telemetry instanceof HTMLDetailsElement && data.mode !== 'snapshot') telemetry.open = true;
      } catch {
        unavailable = true;
      } finally { clearTimeout(timeout); busy = false; renderStatus(); }
    }
    function renderStatus() {
      const state = monitorStatus(last);
      if (badge) badge.textContent = unavailable ? 'Unavailable · last verified data retained' : state;
      root?.setAttribute('data-status', !unavailable && state === 'COLLECTING · LIVE' ? 'live' : 'snapshot');
    }
    void refresh();
    setInterval(renderStatus, 10_000);
    setInterval(() => { void refresh(); }, 30_000);
    document.addEventListener('visibilitychange', () => { renderStatus(); if (!document.hidden) void refresh(); });
    window.addEventListener('pagehide', () => { controller?.abort(); });
  }
}
