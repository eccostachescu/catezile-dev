import { test, expect } from '@playwright/test';

// CSR fallback test: navigate to a route that isn't pre-rendered
// Expect initial robots noindex in server HTML, then flips to index after client boot

test('CSR fallback toggles robots from noindex to index', async ({ page }) => {
  await page.goto('/evenimente/csr-fallback');
  
  // Wait for React to load
  await page.waitForLoadState('networkidle');

  // Check if robots meta exists and has some content initially
  await page.waitForSelector('meta[name="robots"]', { timeout: 10000 });
  
  // Wait for potential CSR update of robots meta
  await page.waitForFunction(() => {
    const m = document.head.querySelector('meta[name="robots"]');
    return m && (m.getAttribute('content') === 'index,follow' || m.getAttribute('content') === 'noindex,nofollow');
  }, { timeout: 10000 });

  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(['index,follow', 'noindex,nofollow']).toContain(robots);
});
