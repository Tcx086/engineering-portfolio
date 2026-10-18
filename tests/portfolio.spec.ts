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
    expect(await page.locator('script[src]').count()).toBe(0);
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
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: /Download resume/ }).click();
  expect((await download).suggestedFilename()).toBe('tom-chen-resume.txt');
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
