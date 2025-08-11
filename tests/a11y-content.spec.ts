import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/evenimente/untold',
  '/sport/fcsb-cfr',
  '/filme/morometii-3',
];

test.describe('A11y — Content pages', () => {
  for (const path of pages) {
    test(`no critical a11y violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toHaveLength(0);
    });
  }
});
