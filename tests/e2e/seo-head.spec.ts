import { test, expect } from '@playwright/test';

// Helper to get content of meta tag
async function metaContent(page, name) {
  return page.locator(`head meta[name="${name}"]`).first().getAttribute('content');
}

async function ogContent(page, prop) {
  return page.locator(`head meta[property="${prop}"]`).first().getAttribute('content');
}

test.describe('SEO Head tags', () => {
  test('Event page has title, canonical, og:image and robots index', async ({ page }) => {
    await page.goto('/evenimente/untold');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('head title')).toBeVisible();
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', /\/evenimente\//);
    await expect(page.locator('head meta[property="og:image"]')).toBeVisible();
    const robots = await metaContent(page, 'robots');
    expect(robots).toBe('index,follow');
  });

  test('Embed page is noindex', async ({ page }) => {
    await page.goto('/embed/abc');
    await page.waitForLoadState('networkidle');
    const robots = await metaContent(page, 'robots');
    expect(robots).toBe('noindex,nofollow');
  });
});
