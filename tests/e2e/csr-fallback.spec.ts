import { test, expect } from '@playwright/test';

// CSR fallback test: navigate to a route that isn't pre-rendered
// Expect initial robots noindex in server HTML, then flips to index after client boot

test('CSR fallback toggles robots from noindex to index', async ({ page }) => {
  await page.goto('/evenimente/csr-fallback');

  const initialHtml = await page.content();
  expect(initialHtml).toContain('name="robots" content="noindex,nofollow"');

  await page.waitForFunction(() => {
    const m = document.head.querySelector('meta[name="robots"]');
    return m && m.getAttribute('content') === 'index,follow';
  }, { timeout: 5000 });

  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toBe('index,follow');
});
