import { test, expect } from '@playwright/test';

test('home shows H1 and search (or search button on mobile)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const search = page.getByRole('search');
  if (await search.count()) {
    await expect(search).toBeVisible();
  } else {
    await expect(page.getByRole('button', { name: /Caută/i })).toBeVisible();
  }
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
