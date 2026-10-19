import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { publicFixture } from './fixtures.mjs';

const origin = process.env.PUBLIC_TELEMETRY_PREVIEW;
assert.match(origin ?? '', /^https:\/\/portfolio-public-telemetry-preview\.[a-z0-9]+\.workers\.dev$/);
const token = process.env.PUBLIC_PUBLISH_TOKEN;
assert.ok(token?.length >= 32, 'Supply the isolated preview publisher token privately');
const evidence = { syntheticOnly: true, realCollectorIntegration: 'UNVERIFIED', checks: [], observations: [] };
async function post(body, authorized = true) {
  return fetch(`${origin}/ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
}
async function check(name, response, status) {
  assert.equal(response.status, status, name);
  await response.body?.cancel();
  evidence.checks.push({ name, status });
}
await check('Public route rejects writes', await fetch(`${origin}/public/collector`, { method: 'POST' }), 405);
await check('Ingestion requires authentication', await post(publicFixture(), false), 401);
await check('Extra private fields rejected', await post({ ...publicFixture(), hostname: 'PRIVATE_TEST_VALUE' }), 400);
await check('Unverified live mode rejected', await post({ ...publicFixture(), mode: 'live' }), 409);
await check('Oversized payload rejected', await post({ padding: 'x'.repeat(4097) }), 400);
const first = publicFixture(Date.now(), 100);
await check('First synthetic observation accepted', await post(first), 202);
await check('Replay rejected', await post(first), 409);
// The platform limiter is approximate; the database write interval is exact.
let limited = false;
for (let attempt = 0; attempt < 12 && !limited; attempt++) {
  const response = await post(first);
  limited = response.status === 429;
  assert.ok([409, 429].includes(response.status));
  await response.body?.cancel();
  if (!limited) await new Promise(resolve => setTimeout(resolve, 250));
}
assert.ok(limited, 'Platform rate limiter rejected a bounded preview-only burst');
evidence.checks.push({ name: 'Platform rate limiter rejected bounded preview-only burst', status: 429 });
const firstRead = await (await fetch(`${origin}/public/collector`)).json();
assert.equal(firstRead.tradesPersisted, 100);
evidence.observations.push(firstRead);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Test-only same-origin adapter: the response is fetched from the deployed Worker.
  await page.route('**/monitoring/collector-public.json', async route => {
    const response = await fetch(`${origin}/public/collector`, { signal: AbortSignal.timeout(5000) });
    await route.fulfill({ status: response.status, contentType: 'application/json', body: await response.text() });
  });
  await page.clock.install();
  await page.goto('http://127.0.0.1:4173/projects/microstructure-discovery-factory/');
  await page.locator('[data-monitor-field="tradesPersisted"]').filter({ hasText: /^100$/ }).waitFor();
  assert.equal(await page.getByRole('status').textContent(), 'Synthetic test data · NOT LIVE');
  await page.locator('.public-monitor').screenshot({ path: '.local/v1.4/after/synthetic-pipeline-first.png' });
  console.log('Synthetic 100 displayed from deployed Worker; waiting 65 seconds for the bounded write window.');
  // Two short waits permit progress updates from the parent process.
  await new Promise(resolve => setTimeout(resolve, 35_000));
  await new Promise(resolve => setTimeout(resolve, 30_000));
  const second = publicFixture(Date.now(), 200);
  await check('Second synthetic observation accepted', await post(second), 202);
  const secondRead = await (await fetch(`${origin}/public/collector`)).json();
  assert.equal(secondRead.runId, firstRead.runId);
  assert.ok(secondRead.observedAt > firstRead.observedAt);
  assert.equal(secondRead.tradesPersisted, 200);
  evidence.observations.push(secondRead);
  await page.clock.fastForward(70_000);
  await page.locator('[data-monitor-field="tradesPersisted"]').filter({ hasText: /^200$/ }).waitFor();
  await page.locator('.public-monitor').screenshot({ path: '.local/v1.4/after/synthetic-pipeline-second.png' });
  evidence.checks.push({ name: 'Browser displayed changed synthetic observation from deployed Worker', status: 'passed' });
  await page.clock.fastForward(200_000);
  assert.match(await page.getByRole('status').textContent(), /STALE/);
  assert.equal(await page.locator('[data-monitor-field="elapsedSeconds"]').textContent(), '0h 3m');
  evidence.checks.push({ name: 'Disabled-source age does not invent elapsed time', status: 'passed' });
} finally {
  await browser.close();
  await writeFile('.local/v1.4/preview-pipeline-evidence.json', JSON.stringify(evidence, null, 2));
}
console.log(JSON.stringify(evidence, null, 2));
