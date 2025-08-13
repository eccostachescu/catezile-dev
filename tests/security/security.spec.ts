import { test, expect } from '@playwright/test';

test.describe('Security Shield', () => {
  test('should block suspicious user agents', async ({ page, context }) => {
    // Set suspicious user agent
    await context.setExtraHTTPHeaders({
      'User-Agent': 'curl/7.68.0'
    });

    const response = await page.request.post('/api/test-endpoint', {
      data: { test: 'data' }
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Request blocked');
  });

  test('should enforce rate limits', async ({ page }) => {
    // Simulate multiple rapid requests
    const promises = Array.from({ length: 35 }, () => 
      page.request.post('/api/test-endpoint', {
        data: { test: 'data' }
      })
    );

    const responses = await Promise.all(promises);
    
    // Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('should validate file uploads', async ({ page }) => {
    // Test oversized file
    const largeFile = Buffer.alloc(3 * 1024 * 1024, 'a'); // 3MB
    
    const response = await page.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'large.txt',
          mimeType: 'text/plain',
          buffer: largeFile
        }
      }
    });

    expect(response.status()).toBe(413);
  });

  test('should block invalid file types', async ({ page }) => {
    // Test SVG upload (should be blocked)
    const svgContent = '<svg><script>alert("xss")</script></svg>';
    
    const response = await page.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.svg',
          mimeType: 'image/svg+xml',
          buffer: Buffer.from(svgContent)
        }
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid file type');
  });
});

test.describe('XSS Protection', () => {
  test('should sanitize user input', async ({ page }) => {
    await page.goto('/create-event');
    
    // Try to inject script
    await page.fill('[name="title"]', '<script>alert("xss")</script>');
    await page.fill('[name="description"]', '<img src=x onerror=alert("xss")>');
    
    await page.click('button[type="submit"]');
    
    // Check that content is sanitized in the rendered page
    await page.waitForSelector('.event-title');
    const title = await page.textContent('.event-title');
    expect(title).not.toContain('<script>');
    expect(title).not.toContain('onerror');
  });

  test('should prevent HTML injection in form fields', async ({ page }) => {
    await page.goto('/create-countdown');
    
    const maliciousInput = '<iframe src="javascript:alert(1)"></iframe>';
    await page.fill('[name="title"]', maliciousInput);
    
    // Submit form and check output
    await page.click('button[type="submit"]');
    
    // Verify no script execution
    const dialogs: string[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog.message());
      dialog.dismiss();
    });
    
    await page.waitForTimeout(1000);
    expect(dialogs).toHaveLength(0);
  });
});

test.describe('Turnstile Protection', () => {
  test('should require Turnstile verification for UGC', async ({ page }) => {
    await page.goto('/create-countdown');
    
    await page.fill('[name="title"]', 'Test Countdown');
    await page.fill('[name="target_date"]', '2025-12-31');
    
    // Try to submit without Turnstile
    await page.click('button[type="submit"]');
    
    // Should show error about security verification
    await expect(page.locator('text=security verification')).toBeVisible();
  });

  test('should detect honeypot fields', async ({ page }) => {
    await page.goto('/create-event');
    
    // Fill normal fields
    await page.fill('[name="title"]', 'Test Event');
    await page.fill('[name="date"]', '2025-12-31');
    
    // Trigger honeypot (this would normally be hidden)
    await page.evaluate(() => {
      const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
      if (honeypot) honeypot.value = 'bot-filled';
    });
    
    await page.click('button[type="submit"]');
    
    // Should be blocked
    await expect(page.locator('text=spam')).toBeVisible();
  });
});

test.describe('Security Headers', () => {
  test('should include security headers', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response?.headers() || {};
    
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['content-security-policy']).toContain('default-src');
  });

  test('should block framing', async ({ page, context }) => {
    // Try to load in iframe
    const html = `
      <html>
        <body>
          <iframe src="${page.url()}" width="800" height="600"></iframe>
        </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Check if iframe is blocked
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    
    // The content should not load due to X-Frame-Options
    const iframeContent = await iframe.contentFrame();
    expect(iframeContent).toBeNull();
  });
});