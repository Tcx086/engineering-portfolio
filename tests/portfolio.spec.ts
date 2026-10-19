import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/projects/', '/notes/', '/about/', '/resume/', '/contact/', '/projects/microstructure-discovery-factory/', '/projects/market-context-engine/', '/projects/lomidance/', '/projects/portfolio-optimization/', '/notes/dedicated-linux-market-data-collector/', '/notes/websocket-reconnection-data-completeness/'];
for (const route of routes) {
  test(`${route} renders without overflow or accessibility violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(a11y.violations).toEqual([]);
    expect(await page.locator('script[src]').count()).toBe(route === '/projects/microstructure-discovery-factory/' ? 1 : 0);
  });
}
test('keyboard navigation, project links and resume download work', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('link', { name: 'Explore my work' }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await page.getByRole('link', { name: 'Microstructure Discovery Factory', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Microstructure Discovery Factory');
  await page.getByRole('link', { name: 'Resume', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resume & Experience');
  await expect(page.getByText(/Recommended · 3 pages/)).toBeVisible();
  await expect(page.getByText(/Quick review · 1 page/)).toBeVisible();
  const fullDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download Full Resume (PDF)', exact: true }).click();
  expect((await fullDownload).suggestedFilename()).toBe('tom-chen-master-resume-public.pdf');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download Concise Resume (PDF)', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('tom-chen-resume.pdf');
  const textDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: /Plain text version/ }).click();
  expect((await textDownload).suggestedFilename()).toBe('tom-chen-resume.txt');
  await page.screenshot({ path: `test-results/resume-${test.info().project.name}.png`, fullPage: true });
});
test('technical details are optional and keyboard accessible', async ({ page }) => {
  await page.goto('/projects/microstructure-discovery-factory/');
  const detail = page.locator('details.technical-detail').first();
  const content = detail.getByText(/The pipeline separates/);
  await expect(content).toBeHidden();
  await detail.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(content).toBeVisible();
  const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(a11y.violations).toEqual([]);
});

const collectorPath = '/projects/microstructure-discovery-factory/';
const snapshotPath = '**/monitoring/collector-public.json';
function liveFixture() {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return { schemaVersion: 1, mode: 'live', preparedAt: timestamp, observedAt: timestamp, runId: 'public-test-campaign', collectorState: 'collecting', elapsedSeconds: 75, tradesPersisted: 1234, l2Persisted: 456, sequenceErrors: 0, campaignResult: 'pending', lastRunSummary: 'Test fixture: approved public observation.' };
}
test('public monitor accepts reviewed live data and refreshes without overlapping requests', async ({ page }) => {
  let requests = 0;
  const methods: string[] = [];
  await page.clock.install();
  await page.route(snapshotPath, async route => { requests++; methods.push(route.request().method()); await route.fulfill({ json: { ...liveFixture(), tradesPersisted: requests * 1234 } }); });
  await page.goto(collectorPath);
  await expect(page.getByRole('status')).toHaveText('COLLECTING · LIVE');
  await expect(page.locator('[data-monitor-field="tradesPersisted"]')).toHaveText('1,234');
  await expect(page.locator('[data-monitor-field="sequenceErrors"]')).toHaveText('0');
  await page.clock.fastForward(30_000);
  await expect(page.locator('[data-monitor-field="tradesPersisted"]')).toHaveText('2,468');
  expect(methods).toEqual(['GET', 'GET']);
});
test('public monitor keeps its server-rendered fallback when refresh fails', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(snapshotPath, route => route.fulfill({ status: 503, body: '' }));
  await page.goto(collectorPath);
  await expect(page.getByRole('status')).toHaveText('Unavailable · last verified data retained');
  await expect(page.locator('[data-monitor-summary]')).toContainText('No current-run research finding');
  await page.locator('.monitor-telemetry summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-monitor-field="sequenceErrors"]')).toHaveText('Not published');
  expect(errors).toEqual([]);
});
test('a retained observation ages out when the publisher stops sending updates', async ({ page }) => {
  await page.clock.install();
  const fixed = liveFixture();
  await page.route(snapshotPath, route => route.fulfill({ json: fixed }));
  await page.goto(collectorPath);
  await expect(page.getByRole('status')).toHaveText('COLLECTING · LIVE');
  await page.clock.fastForward(190_000);
  await expect(page.getByRole('status')).toHaveText('STALE / DATA DELAYED');
  await expect(page.locator('[data-monitor-field="elapsedSeconds"]')).toHaveText('0h 1m');
  await page.unroute(snapshotPath);
  await page.route(snapshotPath, route => route.fulfill({ status: 503 }));
  await page.clock.fastForward(30_000);
  await expect(page.getByRole('status')).toHaveText('Unavailable · last verified data retained');
  await expect(page.locator('[data-monitor-field="tradesPersisted"]')).toHaveText('1,234');
});
test('stopped and synthetic observations never display a live indicator', async ({ page }) => {
  await page.route(snapshotPath, route => route.fulfill({ json: { ...liveFixture(), collectorState: 'stopped' } }));
  await page.goto(collectorPath);
  await expect(page.getByRole('status')).toHaveText('STOPPED');
  await page.unroute(snapshotPath);
  await page.route(snapshotPath, route => route.fulfill({ json: { ...liveFixture(), mode: 'synthetic' } }));
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Synthetic test data · NOT LIVE');
  await expect(page.locator('.public-monitor')).toHaveAttribute('data-status', 'snapshot');
});
test('regressing counters retain verified values and reduced motion suppresses number transitions', async ({ page }) => {
  let requests = 0;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.route(snapshotPath, route => route.fulfill({ json: { ...liveFixture(), tradesPersisted: ++requests === 1 ? 1234 : 1 } }));
  await page.goto(collectorPath);
  await expect(page.getByRole('status')).toHaveText('COLLECTING · LIVE');
  expect(await page.locator('[data-monitor-field="tradesPersisted"]').evaluate(el => el.getAnimations().length)).toBe(0);
  await page.clock.fastForward(30_000);
  await expect(page.getByRole('status')).toHaveText('Unavailable · last verified data retained');
  await expect(page.locator('[data-monitor-field="tradesPersisted"]')).toHaveText('1,234');
});
test('public monitor rejects private fields and keeps delayed observations honest', async ({ page }) => {
  await page.route(snapshotPath, route => route.fulfill({ json: { ...liveFixture(), hostname: 'PRIVATE_TEST_VALUE' } }));
  await page.goto(collectorPath);
  await expect(page.getByRole('status')).toHaveText('Unavailable · last verified data retained');
  await expect(page.locator('body')).not.toContainText('PRIVATE_TEST_VALUE');
  await page.unroute(snapshotPath);
  await page.route(snapshotPath, route => route.fulfill({ json: { ...liveFixture(), observedAt: new Date(Date.now() - 240000).toISOString().replace(/\.\d{3}Z$/, 'Z') } }));
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('STALE / DATA DELAYED');
});
test.describe('monitor without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('retained evidence and native telemetry disclosure still work', async ({ page }) => {
    await page.goto(collectorPath);
    await expect(page.getByRole('status')).toHaveText('Snapshot only');
    await expect(page.locator('[data-monitor-summary]')).toContainText('No current-run research finding');
    await page.locator('.monitor-telemetry summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-monitor-field="tradesPersisted"]')).toBeVisible();
    await expect(page.locator('[data-monitor-field="tradesPersisted"]')).toHaveText('Not published');
  });
});
test('architecture and source views stay readable with reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(collectorPath);
  await expect(page.locator('.capture-architecture .process-flow > li')).toHaveCount(6);
  await expect(page.getByText('Monitoring & lifecycle control', { exact: true })).toBeVisible();
  const motion = await page.locator('.public-monitor').evaluate(el => getComputedStyle(el).animationName);
  expect(motion).toBe('none');
  await page.locator('.public-monitor').screenshot({ path: `test-results/monitor-${testInfo.project.name}.png` });
  await page.locator('.capture-architecture').screenshot({ path: `test-results/architecture-${testInfo.project.name}.png` });
  await page.goto('/projects/market-context-engine/');
  await expect(page.locator('.source-landscape article')).toHaveCount(6);
  await page.locator('.project-visual').screenshot({ path: `test-results/sources-${testInfo.project.name}.png` });
});
test('representative rendering and basic resource budget', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return { domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd), bodyBytes: navigation.decodedBodySize + resources.reduce((sum, resource) => sum + resource.decodedBodySize, 0), scripts: resources.filter((resource) => resource.initiatorType === 'script').length };
  });
  expect(metrics.bodyBytes).toBeLessThan(100_000);
  expect(metrics.scripts).toBe(0);
  await testInfo.attach('basic-performance', { body: JSON.stringify(metrics), contentType: 'application/json' });
  await page.goto('/notes/websocket-reconnection-data-completeness/');
  await page.screenshot({ path: `test-results/note-${testInfo.project.name}.png`, fullPage: true });
});
