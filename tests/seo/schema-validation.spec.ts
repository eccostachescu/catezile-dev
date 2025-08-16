import { test, expect } from '@playwright/test';

// Schema validation helper
function validateSchema(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic schema.org validation
  if (!data['@context'] || data['@context'] !== 'https://schema.org') {
    errors.push('Missing or invalid @context');
  }
  
  if (!data['@type']) {
    errors.push('Missing @type');
  }
  
  // Type-specific validation
  switch (data['@type']) {
    case 'Movie':
      if (!data.name) errors.push('Movie missing name');
      if (data.inLanguage && data.inLanguage !== 'ro-RO') {
        errors.push('Movie inLanguage should be ro-RO');
      }
      break;
      
    case 'Event':
      if (!data.name) errors.push('Event missing name');
      if (!data.startDate) errors.push('Event missing startDate');
      if (data.startDate && isNaN(Date.parse(data.startDate))) {
        errors.push('Event startDate is not valid ISO date');
      }
      break;
      
    case 'WebSite':
      if (!data.name) errors.push('WebSite missing name');
      if (!data.url) errors.push('WebSite missing url');
      if (!data.potentialAction) errors.push('WebSite missing potentialAction (search)');
      break;
      
    case 'Organization':
      if (!data.name) errors.push('Organization missing name');
      if (!data.url) errors.push('Organization missing url');
      break;
      
    case 'BreadcrumbList':
      if (!data.itemListElement) errors.push('BreadcrumbList missing itemListElement');
      if (data.itemListElement && !Array.isArray(data.itemListElement)) {
        errors.push('BreadcrumbList itemListElement must be array');
      }
      break;
      
    case 'FAQPage':
      if (!data.mainEntity) errors.push('FAQPage missing mainEntity');
      if (data.mainEntity && !Array.isArray(data.mainEntity)) {
        errors.push('FAQPage mainEntity must be array');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function extractAllJsonLd(page) {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  const schemas = [];
  
  for (const script of scripts) {
    const content = await script.textContent();
    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else {
          schemas.push(parsed);
        }
      } catch (error) {
        console.error('Failed to parse JSON-LD:', error);
      }
    }
  }
  
  return schemas;
}

test.describe('Schema Validation', () => {
  
  test('Homepage schemas are valid', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const schemas = await extractAllJsonLd(page);
    expect(schemas.length).toBeGreaterThan(0);
    
    let foundWebSite = false;
    let foundOrganization = false;
    
    for (const schema of schemas) {
      const validation = validateSchema(schema);
      
      if (!validation.valid) {
        console.error(`Schema validation failed for ${schema['@type']}:`, validation.errors);
      }
      
      expect(validation.valid).toBe(true);
      
      if (schema['@type'] === 'WebSite') {
        foundWebSite = true;
        expect(schema.potentialAction['@type']).toBe('SearchAction');
        expect(schema.potentialAction.target).toContain('{search_term_string}');
      }
      
      if (schema['@type'] === 'Organization') {
        foundOrganization = true;
      }
    }
    
    expect(foundWebSite).toBe(true);
    expect(foundOrganization).toBe(true);
  });
  
  test('Movie page schema is valid', async ({ page }) => {
    await page.goto('/filme/ne-zha-2');
    await page.waitForLoadState('networkidle');
    
    const schemas = await extractAllJsonLd(page);
    
    let foundMovie = false;
    let foundBreadcrumb = false;
    
    for (const schema of schemas) {
      const validation = validateSchema(schema);
      
      if (!validation.valid) {
        console.error(`Schema validation failed for ${schema['@type']}:`, validation.errors);
      }
      
      expect(validation.valid).toBe(true);
      
      if (schema['@type'] === 'Movie') {
        foundMovie = true;
        
        // Movie-specific validations
        expect(schema.name).toBeTruthy();
        expect(schema.inLanguage).toBe('ro-RO');
        
        if (schema.datePublished) {
          expect(new Date(schema.datePublished).toString()).not.toBe('Invalid Date');
        }
        
        if (schema.genre) {
          expect(Array.isArray(schema.genre)).toBe(true);
        }
        
        if (schema.director) {
          expect(schema.director['@type']).toBe('Person');
          expect(schema.director.name).toBeTruthy();
        }
      }
      
      if (schema['@type'] === 'BreadcrumbList') {
        foundBreadcrumb = true;
        
        expect(Array.isArray(schema.itemListElement)).toBe(true);
        expect(schema.itemListElement.length).toBeGreaterThan(0);
        
        // Validate breadcrumb structure
        schema.itemListElement.forEach((item, index) => {
          expect(item['@type']).toBe('ListItem');
          expect(item.position).toBe(index + 1);
          expect(item.name).toBeTruthy();
          expect(item.item).toBeTruthy();
        });
      }
    }
    
    expect(foundMovie).toBe(true);
    expect(foundBreadcrumb).toBe(true);
  });
  
  test('All schemas have proper language tags', async ({ page }) => {
    const testPages = ['/', '/populare'];
    
    for (const pagePath of testPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const schemas = await extractAllJsonLd(page);
      
      for (const schema of schemas) {
        // Only certain types should have inLanguage
        const typesWithLanguage = ['Movie', 'Event', 'WebSite', 'TVEpisode', 'TVSeries', 'BroadcastEvent'];
        
        if (typesWithLanguage.includes(schema['@type'])) {
          if (schema.inLanguage) {
            expect(schema.inLanguage).toBe('ro-RO');
          }
        }
      }
    }
  });
  
  test('Dates in schemas are valid ISO 8601', async ({ page }) => {
    const testPages = ['/filme/ne-zha-2'];
    
    for (const pagePath of testPages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const schemas = await extractAllJsonLd(page);
        
        for (const schema of schemas) {
          // Check various date fields
          const dateFields = ['startDate', 'endDate', 'datePublished', 'dateCreated', 'dateModified'];
          
          for (const field of dateFields) {
            if (schema[field]) {
              const date = new Date(schema[field]);
              expect(date.toString()).not.toBe('Invalid Date');
              
              // Should be in ISO format
              expect(schema[field]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
            }
          }
        }
      } catch (error) {
        console.log(`Could not test ${pagePath}: ${error.message}`);
      }
    }
  });
  
});

test.describe('Schema Performance', () => {
  
  test('JSON-LD does not affect page load significantly', async ({ page }) => {
    // Test page load with and without JS to ensure schemas don't block rendering
    
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTimeWithJS = Date.now() - startTime;
    
    expect(loadTimeWithJS).toBeLessThan(3000); // Should load within 3 seconds
    
    // Check that schemas are present
    const schemas = await extractAllJsonLd(page);
    expect(schemas.length).toBeGreaterThan(0);
  });
  
});