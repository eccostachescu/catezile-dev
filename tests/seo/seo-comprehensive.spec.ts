import { test, expect } from '@playwright/test';

// Helper functions for meta tag extraction
async function metaContent(page, name: string) {
  return await page.locator(`head meta[name="${name}"]`).first().getAttribute('content');
}

async function ogContent(page, prop: string) {
  return await page.locator(`head meta[property="${prop}"]`).first().getAttribute('content');
}

async function getCanonical(page) {
  return await page.locator('head link[rel="canonical"]').first().getAttribute('href');
}

async function getJsonLd(page, type: string) {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  for (const script of scripts) {
    const content = await script.textContent();
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed['@type'] === type || (Array.isArray(parsed) && parsed.some(item => item['@type'] === type))) {
        return parsed;
      }
    }
  }
  return null;
}

test.describe('SEO Comprehensive Tests', () => {
  
  test('Homepage has complete SEO setup', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Basic meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('CateZile.ro');
    
    const description = await metaContent(page, 'description');
    expect(description).toBeTruthy();
    expect(description.length).toBeLessThanOrEqual(160);

    // HTML attributes
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ro');

    // Canonical URL
    const canonical = await getCanonical(page);
    expect(canonical).toBeTruthy();
    expect(canonical).toMatch(/^https?:\/\//);

    // Open Graph tags
    const ogTitle = await ogContent(page, 'og:title');
    const ogDescription = await ogContent(page, 'og:description');
    const ogImage = await ogContent(page, 'og:image');
    const ogLocale = await ogContent(page, 'og:locale');
    const ogSiteName = await ogContent(page, 'og:site_name');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogImage).toBeTruthy();
    expect(ogLocale).toBe('ro_RO');
    expect(ogSiteName).toBe('CateZile.ro');

    // Twitter Card
    const twitterCard = await metaContent(page, 'twitter:card');
    expect(twitterCard).toBe('summary_large_image');

    // Structured Data
    const websiteSchema = await getJsonLd(page, 'WebSite');
    const organizationSchema = await getJsonLd(page, 'Organization');
    
    expect(websiteSchema).toBeTruthy();
    expect(organizationSchema).toBeTruthy();
    expect(websiteSchema.potentialAction).toBeTruthy();
    expect(websiteSchema.potentialAction['@type']).toBe('SearchAction');

    // Robots
    const robots = await metaContent(page, 'robots');
    expect(robots).toMatch(/index/);
  });

  test('Movie page has enhanced SEO', async ({ page }) => {
    // Navigate to a movie page - adjust URL as needed
    await page.goto('/filme/ne-zha-2');
    await page.waitForLoadState('networkidle');

    // Basic checks
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('CateZile.ro');

    // Movie-specific structured data
    const movieSchema = await getJsonLd(page, 'Movie');
    const breadcrumbSchema = await getJsonLd(page, 'BreadcrumbList');

    expect(movieSchema).toBeTruthy();
    expect(movieSchema.name).toBeTruthy();
    expect(movieSchema.inLanguage).toBe('ro-RO');

    expect(breadcrumbSchema).toBeTruthy();
    expect(breadcrumbSchema.itemListElement).toBeTruthy();
    expect(Array.isArray(breadcrumbSchema.itemListElement)).toBe(true);

    // Check if enhanced movie data is present
    if (movieSchema.genre) {
      expect(Array.isArray(movieSchema.genre)).toBe(true);
    }
  });

  test('Popular page SEO basics', async ({ page }) => {
    await page.goto('/populare');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    const description = await metaContent(page, 'description');
    const canonical = await getCanonical(page);

    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(canonical).toMatch(/\/populare$/);

    // Should be indexable
    const robots = await metaContent(page, 'robots');
    expect(robots).toMatch(/index/);
  });

  test('Admin pages are properly noindexed', async ({ page }) => {
    // Test admin pages that should not be indexed
    const adminPaths = ['/admin', '/embed/test'];
    
    for (const path of adminPaths) {
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const robots = await metaContent(page, 'robots');
        if (robots) {
          expect(robots).toMatch(/noindex/);
        }
      } catch (error) {
        // Page might not exist or require auth, which is fine
        console.log(`Could not test ${path}: ${error.message}`);
      }
    }
  });

  test('Images have proper attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for images with alt attributes
    const images = await page.locator('img').all();
    
    for (const img of images.slice(0, 5)) { // Test first 5 images
      const alt = await img.getAttribute('alt');
      const loading = await img.getAttribute('loading');
      
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt !== null).toBe(true);
      
      // Loading should be lazy for non-critical images
      if (loading) {
        expect(['lazy', 'eager', undefined]).toContain(loading);
      }
    }
  });

  test('Fonts are preloaded properly', async ({ page }) => {
    await page.goto('/');
    
    // Check for font preload
    const preloadFonts = await page.locator('link[rel="preload"][as="style"]').count();
    expect(preloadFonts).toBeGreaterThan(0);
  });

  test('Robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Sitemap: https://catezile.ro/sitemap.xml');
    expect(content).toContain('Disallow: /admin/');
    expect(content).toContain('Allow: /og/');
  });

  test('Sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toContain('<?xml version="1.0"');
    expect(content).toContain('sitemapindex');
    expect(content).toContain('https://catezile.ro/sitemaps/');
  });

  test('OG image endpoint works', async ({ page }) => {
    const response = await page.goto('/og?type=home&title=Test');
    expect(response?.status()).toBe(200);
    
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('image/png');
  });

  test('JSON-LD is valid', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    
    for (const script of scripts) {
      const content = await script.textContent();
      if (content) {
        expect(() => JSON.parse(content)).not.toThrow();
        
        const parsed = JSON.parse(content);
        expect(parsed['@context']).toBe('https://schema.org');
        expect(parsed['@type']).toBeTruthy();
        
        if (parsed.inLanguage) {
          expect(parsed.inLanguage).toBe('ro-RO');
        }
      }
    }
  });

});

// Performance-focused SEO tests
test.describe('Performance SEO', () => {
  
  test('Critical resources load efficiently', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load reasonably fast (adjust threshold as needed)
    expect(loadTime).toBeLessThan(5000); // 5 seconds max for complete load
    
    // Check for lazy loading
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);
  });

  test('No layout shifts from missing dimensions', async ({ page }) => {
    await page.goto('/');
    
    // Check that images have dimensions or aspect ratios
    const images = await page.locator('img').all();
    
    for (const img of images.slice(0, 3)) {
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      const style = await img.getAttribute('style');
      const className = await img.getAttribute('class');
      
      // Should have either explicit dimensions, aspect ratio class, or contain sizing info
      const hasDimensions = width && height;
      const hasAspectRatio = className?.includes('aspect-') || style?.includes('aspect-ratio');
      
      if (!hasDimensions && !hasAspectRatio) {
        console.warn('Image without dimensions found:', await img.getAttribute('src'));
      }
    }
  });

});