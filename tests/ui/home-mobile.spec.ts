import { test, expect } from '@playwright/test';

test.describe('Home mobile search', () => {
  test('opens search dialog', async ({ page }) => {
    await page.goto('/');
    const searchBtn = page.getByRole('button', { name: /Caută/i });
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('search')).toBeVisible();
  });
});
