import { test, expect } from '@playwright/test';

// Basic OG endpoint checks using Playwright's APIRequestContext

test.skip('OG BF returns PNG with cache headers', async ({ request }) => {
  const res = await request.get('/og?type=bf&merchant=emag');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
  expect(res.headers()['cache-control']).toContain('max-age');
  const etag = res.headers()['etag'];
  expect(etag).toBeTruthy();

  // Revalidate with If-None-Match
  const res2 = await request.get('/og?type=bf&merchant=emag', {
    headers: { 'if-none-match': etag as string },
  });
  expect([200, 304]).toContain(res2.status());
});
