// Global Playwright setup for CateZile.ro tests
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up global test environment for CateZile.ro...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if the application is running
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:8080';
    console.log(`📡 Testing connection to ${baseURL}...`);
    
    await page.goto(baseURL, { timeout: 30000 });
    
    // Verify basic page functionality
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Application is accessible and responsive');
    
    // Set up test data or mock services if needed
    // This could include:
    // - Creating test database records
    // - Setting up mock external APIs
    // - Clearing previous test data
    
    // Mock some basic data for consistent testing
    await page.addInitScript(() => {
      // Set consistent date for testing
      const mockDate = new Date('2024-12-15T10:00:00+02:00');
      Date.now = () => mockDate.getTime();
      
      // Mock localStorage for consistent testing
      localStorage.setItem('test-mode', 'true');
      localStorage.setItem('cookie-consent', 'accepted');
      
      // Mock some feature flags if needed
      window.__TEST_CONFIG__ = {
        enableReminders: true,
        enableAnalytics: false,
        enableAds: false
      };
    });
    
    // Test critical API endpoints
    console.log('🔍 Testing critical API endpoints...');
    
    const endpoints = [
      '/api/healthcheck',
      '/sitemap.xml'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(`${baseURL}${endpoint}`);
        if (response.ok()) {
          console.log(`✅ ${endpoint} is accessible`);
        } else {
          console.warn(`⚠️ ${endpoint} returned status ${response.status()}`);
        }
      } catch (error) {
        console.warn(`⚠️ ${endpoint} is not accessible: ${error}`);
      }
    }
    
    // Set up test database state if needed
    // This could include ensuring certain test data exists
    console.log('📊 Checking test data availability...');
    
    // Verify search functionality
    try {
      const searchResponse = await page.request.get(`${baseURL}/api/search_suggest?q=test`);
      if (searchResponse.ok()) {
        console.log('✅ Search functionality is working');
      }
    } catch (error) {
      console.warn('⚠️ Search functionality may not be available during tests');
    }
    
    console.log('🎯 Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;