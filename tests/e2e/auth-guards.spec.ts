import { test, expect } from "@playwright/test";

test.describe('Auth guards', () => {
  test('redirects /account to /auth/login when not logged in', async ({ page }) => {
    await page.goto('/account');
    await page.waitForURL(/\/auth\/login/);
    await expect(page.locator('h1')).toHaveText(/Autentificare/);
  });
});
