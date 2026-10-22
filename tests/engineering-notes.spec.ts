import { expect, test } from '@playwright/test';

test('new notes are discoverable and link to their related projects', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const notes = [
    { title: 'The Ubuntu Update That Stopped My Market Data Collector', slug: 'ubuntu-update-stopped-market-data-collector', project: 'microstructure-discovery-factory' },
    { title: 'Why I Stopped Waiting for a Perfect Market Dataset', slug: 'research-with-imperfect-market-data', project: 'microstructure-discovery-factory' },
    { title: 'Why Historical Market Context Needs More Than One Timestamp', slug: 'historical-market-context-timestamps', project: 'market-context-engine' }
  ];
  for (const note of notes) {
    await page.goto('/notes/');
    await page.getByRole('link', { name: note.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/notes/${note.slug}/$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(note.title);
    await expect(page.locator('.article-body')).toContainText(/limitations/i);
    const related = page.getByRole('link', { name: 'Related project' });
    await expect(related).toHaveAttribute('href', `/projects/${note.project}/`);
    await related.click();
    await expect(page).toHaveURL(new RegExp(`/projects/${note.project}/$`));
    await page.goto(`/notes/${note.slug}/`);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const back = page.getByRole('link', { name: 'All engineering notes' });
    await back.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/notes\/$/);
  }
});
