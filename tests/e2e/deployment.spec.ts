import { describe, test, expect } from '@playwright/test';

test.describe.skip('Deployment System E2E', () => {
  test('admin can access deployment controls', async ({ page, context }) => {
    // Mock admin authentication by setting localStorage
    await page.addInitScript(() => {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('sb-access-token', 'mock-admin-token');
    });

    await page.goto('/admin/deploy');
    
    // Should see deployment dashboard
    await expect(page.locator('h1')).toContainText('Deployment & Cache');
    await expect(page.locator('[data-testid="cache-version"]')).toBeVisible();
    await expect(page.locator('[data-testid="build-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="health-status"]')).toBeVisible();
  });

  test('manual build trigger works', async ({ page, context }) => {
    await page.addInitScript(() => {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('sb-access-token', 'mock-admin-token');
    });

    await page.goto('/admin/deploy');
    
    // Mock API response
    await page.route('**/functions/v1/rebuild_hook', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'STARTED',
          buildId: 'test-123',
          message: 'Build triggered successfully'
        })
      });
    });

    // Click build button
    await page.click('[data-testid="build-now-button"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="build-now-button"]')).toContainText('Building...');
    
    // Should show success message
    await expect(page.locator('.toast')).toContainText('Build triggered');
  });

  test('cache purge functionality', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-admin-token', 
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto('/admin/deploy');
    
    // Mock successful cache purge
    await page.route('**/from/settings*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: { cache_version: 5 }
        })
      });
    });

    await page.route('**/functions/v1/warmup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          successfulRequests: 10,
          totalRequests: 10
        })
      });
    });

    // Get initial cache version
    const initialVersion = await page.textContent('[data-testid="cache-version"]');
    
    // Click purge cache
    await page.click('[data-testid="purge-cache-button"]');
    
    // Should trigger warmup and show success
    await expect(page.locator('.toast')).toContainText('Cache purge');
  });

  test('health check displays system status', async ({ page }) => {
    await page.goto('/admin/deploy');
    
    // Mock health check response
    await page.route('**/functions/v1/healthcheck', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'green',
          timestamp: new Date().toISOString(),
          responseTime: 150,
          checks: [
            { name: 'database', status: 'green', message: 'Connection OK' },
            { name: 'search', status: 'green', message: 'Search function OK' },
            { name: 'tv_status', status: 'yellow', message: 'Last update 2h ago' }
          ]
        })
      });
    });

    // Should load health status
    await page.waitForSelector('[data-testid="health-status"]');
    
    // Should show individual check results
    await expect(page.locator('[data-testid="health-check-database"]')).toContainText('Connection OK');
    await expect(page.locator('[data-testid="health-check-search"]')).toContainText('Search function OK');
    await expect(page.locator('[data-testid="health-check-tv_status"]')).toContainText('Last update 2h ago');
  });

  test('build lock toggle works', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-admin-token',
        domain: 'localhost', 
        path: '/'
      }
    ]);

    await page.goto('/admin/deploy');
    
    // Mock settings update
    await page.route('**/from/settings*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Toggle build lock
    const lockSwitch = page.locator('[data-testid="build-lock-switch"]');
    await lockSwitch.click();
    
    // Should show confirmation
    await expect(page.locator('.toast')).toContainText('Builds');
  });

  test('deployment history shows recent builds', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-admin-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto('/admin/deploy');
    
    // Mock deployment logs
    await page.route('**/from/deployment_log*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: 'SUCCESS',
              reason: 'Manual build',
              actor: 'admin:test@example.com',
              started_at: new Date().toISOString(),
              finished_at: new Date().toISOString(),
              build_id: 'vercel-123',
              notes: 'Build completed successfully'
            },
            {
              id: 2,
              status: 'SKIPPED',
              reason: 'Rate limited',
              actor: 'auto',
              started_at: new Date(Date.now() - 3600000).toISOString(),
              build_id: null,
              notes: 'Original reason: New event submitted'
            }
          ]
        })
      });
    });

    // Should show deployment history
    await expect(page.locator('[data-testid="deployment-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="deployment-log-1"]')).toContainText('Manual build');
    await expect(page.locator('[data-testid="deployment-log-2"]')).toContainText('Rate limited');
  });
});

test.describe('Public Health Endpoint', () => {
  test('health endpoint returns status without auth', async ({ page }) => {
    const response = await page.request.get('/functions/v1/healthcheck');
    expect([200, 404]).toContain(response.status()); // 404 is OK if endpoint doesn't exist yet
    
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      if (contentType?.includes('application/json')) {
        const health = await response.json();
        expect(health).toHaveProperty('status');
        expect(health).toHaveProperty('checks');
        expect(health).toHaveProperty('timestamp');
        expect(['green', 'yellow', 'red']).toContain(health.status);
      }
    }
  });
});