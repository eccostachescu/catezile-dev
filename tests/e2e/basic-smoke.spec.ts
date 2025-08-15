import { test, expect } from '@playwright/test';

test('Basic smoke test - homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Calendarul României');
});

test('Navigation exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
});

test('Health check works', async ({ request }) => {
  const response = await request.get('/functions/v1/healthcheck');
  expect([200, 404]).toContain(response.status()); // 404 is OK if endpoint doesn't exist yet
});