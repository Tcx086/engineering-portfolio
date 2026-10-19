import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './worker.mjs';
import { sanitizeDashboard, publishOnce } from './exporter.mjs';
import { dashboardFixture, publicFixture } from './fixtures.mjs';

const token = 'a'.repeat(64);
function environment(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const statement = (sql, args = []) => ({ bind: (...params) => statement(sql, params),
    first: async () => db.prepare(sql).get(...args) ?? null,
    run: async () => ({ meta: db.prepare(sql).run(...args) }) });
  return { DB: { prepare: statement }, WRITE_LIMIT: { limit: async () => ({ success: true }) },
    READ_LIMIT: { limit: async () => ({ success: true }) }, PUBLISH_TOKEN: token, PUBLISH_ENABLED: 'true', LIVE_VERIFIED: 'false' };
}
function ingest(data = publicFixture(), secret = token) {
  return new Request('https://example.invalid/ingest', { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}
test('only the explicit public allowlist leaves the dashboard sanitizer', () => {
  const source = dashboardFixture();
  const result = sanitizeDashboard(source, token);
  assert.equal(result.tradesPersisted, 600);
  assert.equal(result.l2Persisted, 600);
  assert.equal(result.sequenceErrors, 0);
  assert.match(result.runId, /^public-[a-f0-9]{20}$/);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_TEST|binance|okx|bybit/);
  assert.equal(sanitizeDashboard(source, token).runId, result.runId);
  const missing = dashboardFixture(); missing.trade_lanes[0].persisted = null;
  assert.throws(() => sanitizeDashboard(missing, token), /counters unavailable/);
  const stale = dashboardFixture(Date.now() - 100_000);
  assert.throws(() => sanitizeDashboard(stale, token), /stale/);
  assert.throws(() => sanitizeDashboard({ schema_version: 'collector-health-v1' }, token), /Unsupported/);
});
test('disabled exporter performs no source read or outbound request', async () => {
  const result = await publishOnce({}, () => assert.fail('Disabled exporter made a request'));
  assert.equal(result.state, 'disabled');
});
test('exporter reads one bounded projection and sends only its sanitized payload', async () => {
  const requests = [];
  const transport = async (url, options) => {
    requests.push({ url: String(url), options });
    return requests.length === 1 ? Response.json(dashboardFixture()) : new Response(null, { status: 202 });
  };
  await publishOnce({ PUBLIC_PUBLISH_ENABLED: 'true', PUBLIC_SOURCE_URL: 'http://127.0.0.1:8787/api/collector',
    PUBLIC_INGEST_URL: 'https://example.invalid/ingest', PUBLIC_PUBLISH_TOKEN: token, PUBLIC_ALIAS_KEY: token }, transport);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].options.method, 'POST');
  assert.doesNotMatch(requests[1].options.body, /PRIVATE_TEST/);
});
test('authentication, read-only routing, disable gate and rate limiting reject writes', async t => {
  const env = environment(t);
  assert.equal((await worker.fetch(ingest(undefined, 'wrong'), env)).status, 401);
  assert.equal((await worker.fetch(ingest(undefined, 'é'.repeat(64)), env)).status, 401);
  assert.equal((await worker.fetch(new Request('https://example.invalid/public/collector', { method: 'POST' }), env)).status, 405);
  assert.equal((await worker.fetch(ingest(), { ...env, PUBLISH_ENABLED: 'false' })).status, 503);
  assert.equal((await worker.fetch(ingest(), { ...env, WRITE_LIMIT: { limit: async () => ({ success: false }) } })).status, 429);
  assert.equal((await worker.fetch(ingest({ ...publicFixture(), mode: 'live' }), env)).status, 409);
});
test('single-row storage enforces monotonic observations, counter totals and write interval', async t => {
  const env = environment(t), now = Date.now();
  assert.equal((await worker.fetch(ingest(publicFixture(now - 40_000)), env)).status, 202);
  assert.equal((await worker.fetch(ingest(publicFixture(now - 40_000)), env)).status, 409);
  // Advance the stored publication clock without waiting; actual SQL remains under test.
  await env.DB.prepare("UPDATE public_observation SET published_at = datetime('now','-40 seconds')").run();
  assert.equal((await worker.fetch(ingest(publicFixture(now - 20_000, 99)), env)).status, 409);
  assert.equal((await worker.fetch(ingest(publicFixture(now - 20_000, 200)), env)).status, 202);
  const read = await worker.fetch(new Request('https://example.invalid/public/collector'), env);
  const data = await read.json();
  assert.equal(data.mode, 'synthetic'); assert.equal(data.tradesPersisted, 200);
  assert.equal(read.headers.get('cache-control'), 'no-store');
});
test('unknown fields, oversized streams and stale source observations never enter storage', async t => {
  const env = environment(t);
  assert.equal((await worker.fetch(ingest({ ...publicFixture(), hostname: 'PRIVATE_TEST' }), env)).status, 400);
  assert.equal((await worker.fetch(ingest(publicFixture(Date.now() - 100_000)), env)).status, 400);
  assert.equal((await worker.fetch(ingest(publicFixture(Date.now() + 10_000)), env)).status, 400);
  const request = ingest();
  const oversized = new Request(request.url, { method: 'POST', headers: request.headers, body: ' '.repeat(4097) });
  assert.equal((await worker.fetch(oversized, env)).status, 400);
  assert.equal((await worker.fetch(new Request('https://example.invalid/public/collector'), env)).status, 503);
});
