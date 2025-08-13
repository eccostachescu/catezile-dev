// Test Utilities for CateZile.ro
// Common helpers for Playwright E2E tests

import { Page, expect } from '@playwright/test';

// Romanian locale configuration for consistent testing
export const ROMANIAN_LOCALE = {
  timeZone: 'Europe/Bucharest',
  locale: 'ro-RO',
  currency: 'RON'
};

// Mock current date for consistent testing
export const MOCK_DATE = new Date('2024-12-15T10:00:00+02:00');

// Common test data
export const TEST_DATA = {
  events: {
    upcoming: {
      title: 'UNTOLD Festival 2024',
      date: '2024-08-08',
      city: 'Cluj-Napoca'
    },
    past: {
      title: 'Neversea 2023',
      date: '2023-07-06',
      city: 'Constanța'
    }
  },
  movies: {
    cinema: {
      title: 'Dune: Part Two',
      releaseDate: '2024-03-01'
    },
    netflix: {
      title: 'Wednesday',
      releaseDate: '2024-01-15'
    }
  },
  matches: {
    liga1: {
      home: 'FCSB',
      away: 'CFR Cluj',
      date: '2024-12-20T20:30:00+02:00'
    },
    international: {
      home: 'România',
      away: 'Franța', 
      date: '2024-12-18T21:45:00+02:00'
    }
  }
};

// Set up Romanian environment for tests
export async function setupRomanianEnvironment(page: Page) {
  await page.addInitScript((locale) => {
    // Mock timezone
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: class extends Intl.DateTimeFormat {
        constructor(locales?: string, options?: any) {
          super(locales || locale.locale, { 
            ...options, 
            timeZone: locale.timeZone 
          });
        }
      }
    });

    // Mock current date for consistency
    const mockDate = new Date('2024-12-15T10:00:00+02:00');
    Date.now = () => mockDate.getTime();
    
    // Override Date constructor
    const OriginalDate = Date;
    (global as any).Date = class extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          super(...args);
        }
      }
      
      static now() {
        return mockDate.getTime();
      }
    };
  }, ROMANIAN_LOCALE);
}

// Mock authentication for protected features
export async function mockAuthentication(page: Page, userType: 'user' | 'admin' = 'user') {
  await page.addInitScript((type) => {
    localStorage.setItem('sb-access-token', `mock-${type}-token`);
    localStorage.setItem('sb-refresh-token', `mock-${type}-refresh`);
    
    // Mock Supabase auth response
    window.__SUPABASE_AUTH_MOCK__ = {
      user: {
        id: `mock-${type}-id`,
        email: `test-${type}@catezile.ro`,
        role: type === 'admin' ? 'ADMIN' : 'USER'
      }
    };
  }, userType);
}

// Wait for page to be fully loaded with content
export async function waitForPageLoad(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
  
  // Wait for critical elements to appear
  await expect(page.locator('h1')).toBeVisible({ timeout });
  
  // Wait for any loading spinners to disappear
  await page.waitForFunction(() => {
    const spinners = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner');
    return spinners.length === 0;
  }, { timeout });
}

// Check for JavaScript errors
export function setupErrorTracking(page: Page): string[] {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  return errors;
}

// Accessibility helpers
export async function checkBasicA11y(page: Page) {
  // Check for single H1
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1);
  
  // Check images have alt text
  const images = page.locator('img:visible');
  const imageCount = await images.count();
  
  for (let i = 0; i < Math.min(imageCount, 10); i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    expect(alt).toBeTruthy();
  }
  
  // Check form inputs have labels
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');
    
    if (id) {
      const hasLabel = await page.locator(`label[for="${id}"]`).count() > 0;
      expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  }
}

// Performance helpers
export async function checkImageOptimization(page: Page) {
  const images = page.locator('img:visible');
  const count = await images.count();
  
  for (let i = 0; i < Math.min(count, 5); i++) {
    const img = images.nth(i);
    
    // Check for width/height attributes (prevent CLS)
    const width = await img.getAttribute('width');
    const height = await img.getAttribute('height');
    
    if (width && height) {
      expect(parseInt(width)).toBeGreaterThan(0);
      expect(parseInt(height)).toBeGreaterThan(0);
    }
    
    // Check for loading="lazy" on non-critical images
    const src = await img.getAttribute('src');
    if (src && !src.includes('hero') && !src.includes('logo')) {
      const loading = await img.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  }
}

// SEO helpers
export async function checkBasicSEO(page: Page) {
  // Title tag exists and has content
  const title = await page.locator('title').textContent();
  expect(title).toBeTruthy();
  expect(title!.length).toBeLessThan(60);
  
  // Meta description exists
  const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(metaDesc).toBeTruthy();
  expect(metaDesc!.length).toBeLessThanOrEqual(160);
  
  // Canonical link exists
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBeTruthy();
  
  // Check for structured data
  const jsonLd = await page.locator('script[type="application/ld+json"]').count();
  expect(jsonLd).toBeGreaterThan(0);
}

// Navigation helpers
export async function navigateToSection(page: Page, section: 'tv' | 'filme' | 'liga-1' | 'sarbatori' | 'evenimente') {
  const sectionMap = {
    'tv': '/tv',
    'filme': '/filme', 
    'liga-1': '/liga-1',
    'sarbatori': '/sarbatori',
    'evenimente': '/evenimente'
  };
  
  await page.goto(sectionMap[section]);
  await waitForPageLoad(page);
}

// Search helpers
export async function performSearch(page: Page, query: string) {
  const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="caută"], input[type="search"]');
  await searchInput.fill(query);
  
  // Wait for suggestions to appear
  await page.waitForSelector('[data-testid="search-suggestion"], .search-suggestion', { timeout: 5000 });
  
  // Press Enter to search
  await searchInput.press('Enter');
  await waitForPageLoad(page);
}

// Reminder helpers
export async function setReminder(page: Page, mockAuth = true) {
  if (mockAuth) {
    await mockAuthentication(page, 'user');
  }
  
  const reminderButton = page.locator('[data-testid="reminder-button"], button:has-text("Amintește"), button:has-text("Reminder")');
  
  if (await reminderButton.isVisible()) {
    await reminderButton.click();
    
    // Handle auth flow or reminder confirmation
    const loginModal = page.locator('[data-testid="login-modal"], .login-modal');
    const reminderModal = page.locator('[data-testid="reminder-modal"], .reminder-modal');
    
    if (await loginModal.isVisible()) {
      // Mock successful login
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('auth-success'));
      });
    }
    
    if (await reminderModal.isVisible()) {
      const confirmButton = reminderModal.locator('button:has-text("Confirmă"), button:has-text("Set Reminder")');
      await confirmButton.click();
    }
  }
}

// Social sharing helpers
export async function testSocialSharing(page: Page) {
  const shareButtons = page.locator('[data-testid*="share"], a[href*="facebook.com"], a[href*="twitter.com"], a[href*="whatsapp"]');
  const count = await shareButtons.count();
  
  if (count > 0) {
    const firstButton = shareButtons.first();
    const href = await firstButton.getAttribute('href');
    
    // Check that share URL contains current page
    expect(href).toContain(encodeURIComponent(page.url()));
  }
}

// Cookie consent helpers
export async function handleCookieConsent(page: Page, accept = true) {
  const cookieBanner = page.locator('[data-testid="cookie-banner"], .cookie-banner, #cookie-consent');
  
  if (await cookieBanner.isVisible()) {
    const button = accept 
      ? cookieBanner.locator('button:has-text("Accept"), button:has-text("Acceptă")')
      : cookieBanner.locator('button:has-text("Reject"), button:has-text("Refuză")');
    
    await button.click();
    await expect(cookieBanner).not.toBeVisible();
  }
}

// Filter helpers for listing pages
export async function applyFilters(page: Page, filters: Record<string, string>) {
  for (const [filterType, value] of Object.entries(filters)) {
    const filterSelect = page.locator(`select[data-filter="${filterType}"], [data-testid="${filterType}-filter"]`);
    
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption(value);
      await page.waitForTimeout(500); // Wait for filter to apply
    }
  }
}

// Responsive design helpers
export async function testResponsiveDesign(page: Page) {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  // Check mobile menu if present
  const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .hamburger');
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await expect(page.locator('[data-testid="mobile-nav"], .mobile-nav')).toBeVisible();
  }
  
  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  
  // Test desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(500);
}

export default {
  setupRomanianEnvironment,
  mockAuthentication,
  waitForPageLoad,
  setupErrorTracking,
  checkBasicA11y,
  checkImageOptimization,
  checkBasicSEO,
  navigateToSection,
  performSearch,
  setReminder,
  testSocialSharing,
  handleCookieConsent,
  applyFilters,
  testResponsiveDesign,
  TEST_DATA,
  ROMANIAN_LOCALE,
  MOCK_DATE
};