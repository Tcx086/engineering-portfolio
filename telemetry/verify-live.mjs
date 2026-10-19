import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { publicSnapshot } from '../src/lib/public-monitor.mjs';

const base = process.env.PORTFOLIO_BASE_URL ?? 'https://portfolio.tcx086.com';
assert.match(base, /^https:\/\/portfolio\.tcx086\.com$/);
await mkdir('.local/dashboard-reuse/after', { recursive: true });
const browser = await chromium.launch();
const observations = [], requests = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('request', request => {
    const url = new URL(request.url());
    assert.equal(url.origin, base, 'Browser must never access a private Dashboard or other origin');
    assert.equal(request.method(), 'GET');
    requests.push(url.pathname);
  });
  page.on('response', async response => {
    if (new URL(response.url()).pathname === '/api/collector-public/' && response.status() === 200) observations.push(publicSnapshot(await response.json()));
  });
  await page.goto(`${base}/projects/microstructure-discovery-factory/`);
  await expect(page.locator('[data-monitor-field="l2Persisted"]')).not.toHaveText('Not published');
  await expect.poll(() => observations.length).toBeGreaterThan(0);
  const first = observations.at(-1);
  assert.ok(['observed', 'live'].includes(first.mode), 'Genuine observations only; no synthetic fixtures');
  await page.locator('.public-monitor').screenshot({ path: '.local/dashboard-reuse/after/real-first.png' });
  console.log(`First real browser observation: ${first.observedAt}; L2 ${first.l2Persisted}. Waiting for a genuine publisher update.`);
  await expect.poll(() => observations.some(next => next.runId === first.runId && next.observedAt > first.observedAt && next.l2Persisted > first.l2Persisted), { timeout: 150_000, intervals: [1000] }).toBe(true);
  const second = observations.find(next => next.runId === first.runId && next.observedAt > first.observedAt && next.l2Persisted > first.l2Persisted);
  await expect(page.locator('[data-monitor-field="l2Persisted"]')).toHaveText(second.l2Persisted.toLocaleString('en-US'));
  await page.locator('.public-monitor').screenshot({ path: '.local/dashboard-reuse/after/real-second.png' });
  await writeFile('.local/dashboard-reuse/real-browser-evidence.json', JSON.stringify({ verifiedAt: new Date().toISOString(), synthetic: false, mockedNetwork: false, first, second, renderedStatus: await page.getByRole('status').textContent(), browserRequests: [...new Set(requests)] }, null, 2));
  console.log(`Second real browser observation: ${second.observedAt}; L2 ${second.l2Persisted}. Same public run; full production path verified.`);
} finally { await browser.close(); }
