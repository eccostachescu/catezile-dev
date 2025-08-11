import { describe, it, expect } from 'vitest';
import { buildCanonical } from '@/seo/canonical';

describe('buildCanonical', () => {
  it('removes UTM and known noise params and trims trailing slash', () => {
    const sp = new URLSearchParams('utm_source=tw&ref=abc&gclid=1&q=test');
    const url = buildCanonical('/evenimente/test/', sp);
    expect(url).toMatch(/\/evenimente\/test\?q=test$/);
    expect(url).not.toContain('utm_');
    expect(url).not.toContain('gclid');
    expect(url).not.toContain('ref=');
  });
});
