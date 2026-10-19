import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { isPublicSnapshot, publicSnapshot, monitorValue, monitorStatus } from '../src/lib/public-monitor.mjs';

const retained = JSON.parse(readFileSync(new URL('../static/monitoring/collector-public.json', import.meta.url), 'utf8'));
const now = Date.now();
/** @param {number} time */
const iso = (time) => new Date(time).toISOString().replace(/\.\d{3}Z$/, 'Z');
const active = () => ({ ...retained, mode: 'live', preparedAt: iso(now), observedAt: iso(now), runId: 'public-test-campaign', collectorState: 'collecting', elapsedSeconds: 75, tradesPersisted: 1234, l2Persisted: 456, sequenceErrors: 0, campaignResult: 'pending', lastRunSummary: 'Test fixture: approved public observation.' });

test('approved artifact has a snapshot state and no invented operational values', () => {
  assert.equal(publicSnapshot(retained).mode, 'snapshot');
  for (const key of ['runId', 'observedAt', 'tradesPersisted', 'l2Persisted', 'sequenceErrors', 'elapsedSeconds']) assert.equal(retained[key], null);
  assert.equal(monitorValue(retained, 'sequenceErrors'), 'Not published');
  assert.equal(monitorStatus(retained, now + 86400000), 'Snapshot only');
});
test('live observations format actual values including a genuine zero', () => {
  const data = publicSnapshot(active());
  assert.equal(monitorValue(data, 'tradesPersisted'), '1,234');
  assert.equal(monitorValue(data, 'sequenceErrors'), '0');
  assert.equal(monitorValue(data, 'elapsedSeconds'), '0h 1m');
  assert.equal(monitorStatus(data, now), 'Live public data');
  assert.equal(monitorStatus(data, now + 121000), 'Delayed public data');
});
test('unknown fields cannot enter a published artifact', () => {
  assert.equal(isPublicSnapshot({ ...retained, hostname: 'PRIVATE_TEST_VALUE' }), false);
  const incomplete = { ...retained }; delete incomplete.preparedAt;
  assert.throws(() => publicSnapshot(incomplete), /public field allowlist/);
});
test('private identifiers, URLs and diagnostic strings are rejected', () => {
  for (const lastRunSummary of ['Visit https://internal.invalid', 'host 192.168.1.2', 'token=example', 'C:\\private\\state', 'Read /var/log/collector', '<script>private</script>']) assert.equal(isPublicSnapshot({ ...retained, lastRunSummary }), false);
  assert.equal(isPublicSnapshot({ ...active(), runId: 'machine-name' }), false);
});
test('counters, enums and live timestamps are validated', () => {
  for (const tradesPersisted of [-1, 1.5, '123', Number.MAX_SAFE_INTEGER + 1]) assert.equal(isPublicSnapshot({ ...active(), tradesPersisted }), false);
  for (const changed of [{ observedAt: null }, { observedAt: '2026-02-30T00:00:00Z' }, { observedAt: iso(now + 60000) }, { collectorState: 'secret_state' }, { mode: { toString: null } }]) assert.equal(isPublicSnapshot({ ...active(), ...changed }), false);
});
