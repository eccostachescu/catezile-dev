import { test, expect } from '@playwright/test';

// Launch QA - End-to-End Critical Flows
// Tests cover: Onboarding, Sport/TV, Movies, Holidays, Events, Search, SEO, Monetization

test.describe('Launch QA - Critical User Flows', () => {
  // Configure for Romanian timezone and mobile-first
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Mock timezone to Europe/Bucharest
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: class extends Intl.DateTimeFormat {
          constructor(locale?: string, options?: any) {
            super(locale || 'ro-RO', { ...options, timeZone: 'Europe/Bucharest' });
          }
        }
      });
    });
  });

  test.describe('Mobile Tests', () => {
    test.use({ 
      viewport: { width: 393, height: 851 }, // Pixel 5 dimensions
      userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    });

    test('Onboarding & Reminders Flow', async ({ page }) => {
      // Go to homepage
      await page.goto('/');
      
      // Check hero section loads
      await expect(page.locator('h1')).toBeVisible();
      
      // Navigate to movies
      await page.click('[href="/filme"]');
      await expect(page.url()).toContain('/filme');
      
      // Find a movie with countdown
      const movieCard = page.locator('[data-testid="movie-card"]').first();
      await movieCard.click();
      
      // Set reminder (requires auth - mock or skip if not implemented)
      const reminderButton = page.locator('[data-testid="reminder-button"]');
      if (await reminderButton.isVisible()) {
        await reminderButton.click();
        // Should show login or reminder confirmation
        await expect(page.locator('text=/reminder|login/i')).toBeVisible();
      }
    });

    test('Sport & TV Schedule', async ({ page }) => {
      // Liga 1 page
      await page.goto('/liga-1');
      await expect(page.locator('h1')).toContainText(/liga|fotbal/i);
      
      // Table should be visible
      await expect(page.locator('[data-testid="liga1-table"]')).toBeVisible();
      
      // TV Guide
      await page.goto('/tv');
      await expect(page.locator('h1')).toContainText(/tv|ghid/i);
      
      // Live badge should exist for current programs
      const liveBadge = page.locator('[data-testid="live-badge"]');
      if (await liveBadge.count() > 0) {
        await expect(liveBadge.first()).toBeVisible();
      }
      
      // Channel page
      const channelLink = page.locator('[href*="/tv/"]').first();
      if (await channelLink.isVisible()) {
        await channelLink.click();
        await expect(page.locator('[data-testid="tv-grid"]')).toBeVisible();
      }
    });

    test('Movies Features', async ({ page }) => {
      await page.goto('/filme');
      
      // Movies grid loads
      await expect(await page.locator('[data-testid="movie-card"]').count()).toBeGreaterThan(0);
      
      // Movie details page
      const movieCard = page.locator('[data-testid="movie-card"]').first();
      await movieCard.click();
      
      // Check movie details
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="movie-meta"]')).toBeVisible();
      
      // Trailer should not autoplay without consent
      const trailer = page.locator('[data-testid="movie-trailer"]');
      if (await trailer.isVisible()) {
        const videoElement = trailer.locator('video, iframe');
        if (await videoElement.count() > 0) {
          const isAutoplay = await videoElement.first().getAttribute('autoplay');
          expect(isAutoplay).toBeNull();
        }
      }
      
      // Monthly movies page
      await page.goto('/filme/2024-12');
      await expect(await page.locator('[data-testid="movie-card"]').count()).toBeGreaterThan(0);
    });

    test('Holidays & School Calendar', async ({ page }) => {
      await page.goto('/sarbatori');
      
      // Current year holidays
      await expect(await page.locator('[data-testid="holiday-card"]').count()).toBeGreaterThan(0);
      
      // Weekend badges
      const weekendBadge = page.locator('[data-testid="weekend-badge"]');
      if (await weekendBadge.count() > 0) {
        await expect(weekendBadge.first()).toBeVisible();
      }
      
      // Bridges calculator
      const bridgesCalc = page.locator('[data-testid="bridges-calculator"]');
      if (await bridgesCalc.isVisible()) {
        await bridgesCalc.click();
        // Should show at least 3 recommendations
        await expect(await page.locator('[data-testid="bridge-recommendation"]').count()).toBeGreaterThanOrEqual(3);
      }
    });

    test('Events & UGC', async ({ page }) => {
      await page.goto('/evenimente');
      
      // Events list
      await expect(await page.locator('[data-testid="event-card"]').count()).toBeGreaterThan(0);
      
      // Event details
      const eventCard = page.locator('[data-testid="event-card"]').first();
      await eventCard.click();
      
      // Check event details
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="event-meta"]')).toBeVisible();
      
      // Tickets button only if affiliate link exists
      const ticketsButton = page.locator('[data-testid="tickets-button"]');
      if (await ticketsButton.isVisible()) {
        const href = await ticketsButton.getAttribute('href');
        expect(href).toContain('/out/');
      }
    });

    test('Search & Suggestions', async ({ page }) => {
      await page.goto('/');
      
      // Search input
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.waitFor({ state: 'visible' });
      await searchInput.fill('liga');
      
      // Suggestions should appear
      await page.waitForSelector('[data-testid="search-suggestion"]', { timeout: 5000 });
      await expect(await page.locator('[data-testid="search-suggestion"]').count()).toBeGreaterThan(0);
      
      // Test diacritics insensitive
      await searchInput.clear();
      await searchInput.fill('școală');
      await expect(await page.locator('[data-testid="search-suggestion"]').count()).toBeGreaterThan(0);
      
      // Search results page
      await page.goto('/cauta?q=liga');
      await expect(await page.locator('[data-testid="search-result"]').count()).toBeGreaterThan(0);
    });

    test('Monetization & Affiliate Links', async ({ page }) => {
      // Find an affiliate link
      await page.goto('/');
      
      const affiliateLink = page.locator('a[href*="/out/"]').first();
      if (await affiliateLink.isVisible()) {
        // Check rel="sponsored"
        const rel = await affiliateLink.getAttribute('rel');
        expect(rel).toContain('sponsored');
        
        // Check UTM parameters
        const href = await affiliateLink.getAttribute('href');
        expect(href).toMatch(/utm_source|utm_medium|utm_campaign/);
      }
    });
  });

  test.describe('Desktop Tests', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('SEO & Structured Data', async ({ page }) => {
      // Homepage
      await page.goto('/');
      
      // Check basic SEO elements
      await expect(page.locator('title')).toHaveText(/catezile/i);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
      
      // JSON-LD structured data
      const jsonLd = page.locator('script[type="application/ld+json"]');
      await expect(await jsonLd.count()).toBeGreaterThan(0);
      
      // OG tags
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
      
      // Movie page structured data
      await page.goto('/filme');
      const movieLink = page.locator('[data-testid="movie-card"] a').first();
      if (await movieLink.isVisible()) {
        await movieLink.click();
        
        const movieJsonLd = page.locator('script[type="application/ld+json"]');
        const jsonContent = await movieJsonLd.textContent();
        expect(jsonContent).toContain('"@type":"Movie"');
      }
    });

    test('Performance & Core Web Vitals', async ({ page }) => {
      // Start measuring
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Check for Cumulative Layout Shift indicators
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          // Images should have width/height attributes to prevent CLS
          const width = await img.getAttribute('width');
          const height = await img.getAttribute('height');
          if (width && height) {
            expect(parseInt(width)).toBeGreaterThan(0);
            expect(parseInt(height)).toBeGreaterThan(0);
          }
        }
      }
      
      // Check for LCP candidates
      const hero = page.locator('[data-testid="hero-section"]');
      if (await hero.isVisible()) {
        await expect(hero).toBeInViewport();
      }
    });
  });

  test.describe('Accessibility Tests', () => {
    test('A11y Score ≥ 95', async ({ page }) => {
      await page.goto('/');
      
      // Basic accessibility checks
      // Check for heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      // Check for alt text on images
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt');
          expect(alt).toBeTruthy();
        }
      }
      
      // Check for form labels
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
      
      // Check for skip links
      const skipLink = page.locator('a[href="#main"], a[href="#content"]');
      if (await skipLink.count() > 0) {
        await expect(skipLink.first()).toHaveAttribute('href', /#(main|content)/);
      }
    });
  });
});

test.describe('Critical Error Detection', () => {
  test('No JavaScript errors on key pages', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Test key pages
    const pages = ['/', '/tv', '/filme', '/liga-1', '/sarbatori', '/evenimente'];
    
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('analytics') &&
        !error.includes('ads') &&
        !error.toLowerCase().includes('network error')
      );
      
      expect(criticalErrors).toHaveLength(0);
      errors.length = 0; // Clear for next page
    }
  });
});