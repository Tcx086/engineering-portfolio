import { expect, test } from '@playwright/test';

test('homepage grid, framing and keyboard access stay balanced across seven widths', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const measurements = [];
  for (const width of [360, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const svg = await (await page.request.get('/city-frame.svg')).text();
    const result = await page.evaluate(source => {
      const bounds = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const hero = bounds('.hero'), main = bounds('main.wrap'), role = bounds('.hero-context');
      const style = getComputedStyle(document.querySelector('.hero')!);
      const decoration = getComputedStyle(document.querySelector('.hero')!, '::before');
      const probe = document.createElement('div');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = `position:fixed;pointer-events:none;opacity:0;left:${hero.left + parseFloat(decoration.left)}px;top:${hero.top + parseFloat(decoration.top)}px;width:${hero.width - parseFloat(decoration.left) - parseFloat(decoration.right)}px;height:${hero.height - parseFloat(decoration.top) - parseFloat(decoration.bottom)}px`;
      probe.innerHTML = source;
      document.body.append(probe);
      try {
        const ornaments = ['top-ornament', 'bottom-ornament', 'skyline-left', 'skyline-right'].map(id => ({ id, rect: probe.querySelector(`#${id}`)!.getBoundingClientRect() }));
        const functional = ['.hero-copy > .eyebrow', '.hero h1', '.hero-description', '.hero-detail', '.hero-actions', '.hero-context'];
        const overlaps = functional.flatMap(selector => {
          const rect = bounds(selector);
          return ornaments.filter(({ rect: art }) => rect.left < art.right && rect.right > art.left && rect.top < art.bottom && rect.bottom > art.top).map(({ id }) => `${selector}: ${id}`);
        });
        const heading = bounds('.hero h1');
        const ornament = ornaments[0].rect;
        const lefts = ['.site-header', '.hero-copy', '.hero-actions', '.selected-work .section-heading', '.featured-project', '.focus-section', '[aria-labelledby="notes"]', '.site-footer'].map(selector => ({ selector, delta: bounds(selector).left - main.left }));
        return {
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth, lefts,
          gutterDifference: main.left - (innerWidth - main.right),
          cardInside: role.left >= main.left - .5 && role.right <= main.right + .5 && role.top >= hero.top && role.bottom <= hero.bottom,
          cardEdgeDelta: innerWidth <= 760 ? role.left - main.left : role.right - main.right,
          columns: style.gridTemplateColumns.split(' ').length,
          headingLines: heading.height / parseFloat(getComputedStyle(document.querySelector('.hero h1')!).lineHeight),
          overlaps, ornamentWidth: ornament.width, ornamentHeight: ornament.height,
          ornamentCenterDelta: (ornament.left + ornament.right - hero.left - hero.right) / 2,
          skylineSymmetry: (ornaments[2].rect.left + ornaments[2].rect.right + ornaments[3].rect.left + ornaments[3].rect.right) / 2 - hero.left - hero.right,
          frameLeft: hero.left + parseFloat(decoration.left), frameRight: hero.right - parseFloat(decoration.right),
          decorationPointerEvents: decoration.pointerEvents,
          overflowRules: [getComputedStyle(document.documentElement).overflowX, getComputedStyle(document.body).overflowX],
          animation: style.animationName
        };
      } finally { probe.remove(); }
    }, svg);
    measurements.push(result);
    expect(result.scrollWidth, `${width}px horizontal overflow`).toBe(width);
    expect(Math.abs(result.gutterDifference)).toBeLessThan(.5);
    for (const { selector, delta } of result.lefts) expect(Math.abs(delta), `${width}px ${selector}`).toBeLessThan(.5);
    expect(result.cardInside).toBe(true);
    expect(Math.abs(result.cardEdgeDelta)).toBeLessThan(.5);
    expect(result.columns).toBe(width <= 760 ? 1 : 2);
    expect(result.headingLines).toBeLessThan(3.1);
    expect(result.overlaps, `${width}px text/ornament intersections`).toEqual([]);
    expect(result.ornamentWidth).toBeCloseTo(84, 0);
    expect(result.ornamentHeight).toBeCloseTo(66, 0);
    expect(Math.abs(result.ornamentCenterDelta)).toBeLessThan(.5);
    expect(Math.abs(result.skylineSymmetry)).toBeLessThan(.5);
    expect(result.frameLeft).toBeGreaterThanOrEqual(0);
    expect(result.frameRight).toBeLessThanOrEqual(width);
    expect(result.decorationPointerEvents).toBe('none');
    expect(result.overflowRules.some(rule => ['hidden', 'clip'].includes(rule))).toBe(false);
    expect(result.animation).toBe('none');
    await page.screenshot({ path: `test-results/homepage-${width}-${testInfo.project.name}.png`, fullPage: true });
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const action = page.getByRole('link', { name: 'Explore my work' });
    await expect(action).toBeFocused();
    expect(await action.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid');
    expect(await action.evaluate(element => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
  }
  await testInfo.attach('homepage-layout-measurements', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
});
