import { test, expect } from '@playwright/test';

test.describe('Input Validation', () => {
  test('should validate form inputs with Zod', async ({ page }) => {
    await page.goto('/create-event');

    // Test empty title
    await page.click('button[type="submit"]');
    await expect(page.locator('text=required')).toBeVisible();

    // Test title too short
    await page.fill('[name="title"]', 'ab');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=least 3 characters')).toBeVisible();

    // Test title too long
    const longTitle = 'a'.repeat(101);
    await page.fill('[name="title"]', longTitle);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=most 100 characters')).toBeVisible();

    // Test invalid date
    await page.fill('[name="title"]', 'Valid Title');
    await page.fill('[name="date"]', 'invalid-date');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=valid date')).toBeVisible();

    // Test past date
    await page.fill('[name="date"]', '2020-01-01');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=future date')).toBeVisible();
  });

  test('should sanitize dangerous input', async ({ page }) => {
    await page.goto('/create-countdown');

    // Test script injection
    await page.fill('[name="title"]', '<script>alert("xss")</script>Test');
    await page.fill('[name="target_date"]', '2025-12-31');

    const response = page.waitForResponse('**/create_countdown');
    await page.click('button[type="submit"]');
    
    const responseData = await (await response).json();
    
    // Check that dangerous content is removed
    expect(responseData.title).not.toContain('<script>');
    expect(responseData.title).toContain('Test');
  });

  test('should validate file uploads', async ({ page }) => {
    await page.goto('/admin/events');

    // Test valid image upload
    await page.setInputFiles('input[type="file"]', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-jpeg-data')
    });

    // Should be accepted
    await expect(page.locator('text=File uploaded')).toBeVisible();

    // Test invalid file type
    await page.setInputFiles('input[type="file"]', {
      name: 'malicious.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('fake-exe-data')
    });

    await expect(page.locator('text=Invalid file type')).toBeVisible();
  });

  test('should prevent SQL injection attempts', async ({ page }) => {
    await page.goto('/search');

    // Common SQL injection patterns
    const sqlInjections = [
      "'; DROP TABLE events; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --"
    ];

    for (const injection of sqlInjections) {
      await page.fill('input[name="q"]', injection);
      await page.click('button[type="submit"]');

      // Should return safe results or error, not execute SQL
      await page.waitForSelector('.search-results, .error-message');
      
      // Check that no SQL error is exposed
      const content = await page.textContent('body');
      expect(content).not.toContain('SQL');
      expect(content).not.toContain('database');
      expect(content).not.toContain('syntax error');
    }
  });

  test('should validate API endpoints', async ({ page }) => {
    // Test with missing required fields
    const response1 = await page.request.post('/api/events_submit', {
      data: {}
    });
    expect(response1.status()).toBe(400);

    // Test with invalid data types
    const response2 = await page.request.post('/api/events_submit', {
      data: {
        title: 123, // Should be string
        date: 'not-a-date',
        category: null
      }
    });
    expect(response2.status()).toBe(400);

    // Test with malicious payload
    const response3 = await page.request.post('/api/events_submit', {
      data: {
        title: '<script>alert("xss")</script>',
        description: '{{constructor.constructor("alert(1)")()}}',
        date: '2025-12-31T10:00:00Z'
      }
    });
    
    // Should sanitize but not reject entirely
    expect([200, 400]).toContain(response3.status());
  });
});

test.describe('Authentication Security', () => {
  test('should require authentication for protected routes', async ({ page }) => {
    // Try to access admin without auth
    const response = await page.goto('/admin/security');
    expect(response?.status()).toBe(401);
  });

  test('should validate JWT tokens', async ({ page }) => {
    // Set invalid JWT
    await page.context().addCookies([{
      name: 'auth-token',
      value: 'invalid.jwt.token',
      domain: 'localhost',
      path: '/'
    }]);

    const response = await page.request.get('/api/protected-endpoint');
    expect(response.status()).toBe(401);
  });

  test('should prevent privilege escalation', async ({ page }) => {
    // Simulate regular user trying to access admin functions
    await page.goto('/login');
    
    // Login as regular user
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Try to access admin API
    const response = await page.request.post('/api/admin/moderate', {
      data: { action: 'approve', eventId: '123' }
    });
    
    expect(response.status()).toBe(403);
  });
});