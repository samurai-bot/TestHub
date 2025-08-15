import { test, expect } from '@playwright/test';

test.describe('Channel News Asia - Homepage and Navigation', () => {
  test('Homepage loads correctly and main navigation is functional', async ({ page }) => {
    // Test configuration
    const baseURL = 'https://www.channelnewsasia.com';
    
    // Step 1: Navigate to Channel News Asia homepage
    await page.goto(baseURL);
    
    // Verify: Homepage loads successfully with all key elements visible
    await expect(page).toHaveTitle(/CNA|Channel NewsAsia/);
    await expect(page.locator('header')).toBeVisible();
    
    // Step 2: Verify main navigation menu is present
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
    
    // Check for typical news site navigation sections
    const navText = await nav.textContent();
    const hasExpectedSections = /singapore|asia|world|business|sport/i.test(navText || '');
    expect(hasExpectedSections).toBeTruthy();
    
    // Step 3: Check that breaking news banner is visible
    const newsSection = page.locator('[class*="news"], [class*="headline"], [class*="breaking"], main').first();
    await expect(newsSection).toBeVisible();
    
    // Step 4: Verify footer navigation and social media links
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Look for social media indicators
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], [class*="social"]');
    const socialCount = await socialLinks.count();
    expect(socialCount).toBeGreaterThan(0);
  });
  
  test('Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('https://www.channelnewsasia.com');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Verify page loads within 5 seconds (5000ms)
    expect(loadTime).toBeLessThan(5000);
  });
});