import { test, expect } from '@playwright/test';

test('home loads and shows H1 and search', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
});

test('sign-in button renders when logged out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Autentificare/i })).toBeVisible();
});

test('/admin redirects when not admin', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForURL('/');
});

test('/404 shows NotFound', async ({ page }) => {
  await page.goto('/404');
  await expect(page.getByRole('heading', { level: 1, name: /404/i })).toBeVisible();
});
