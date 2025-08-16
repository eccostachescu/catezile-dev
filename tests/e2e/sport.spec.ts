import { test, expect } from '@playwright/test';

test('sport page renders with SEO title and filters', async ({ page }) => {
  await page.goto('/sport');
  await expect(page).toHaveTitle(/Meciuri Live — Program TV Sport — CateZile\.ro/i);
  await expect(page.getByRole('navigation', { name: 'Filtre timp' })).toBeVisible();
});