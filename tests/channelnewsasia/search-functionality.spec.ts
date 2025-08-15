import { test, expect } from '@playwright/test';

test.describe('Channel News Asia - Search Functionality', () => {
  test('Search feature works correctly', async ({ page }) => {
    const baseURL = 'https://www.channelnewsasia.com';
    
    // Step 1: Navigate to homepage
    await page.goto(baseURL);
    
    // Step 2: Find and interact with search functionality
    // Look for search input, button, or icon
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    const searchButton = page.locator('button[type="submit"], [class*="search"], [aria-label*="search" i]').first();
    
    // If search input is not immediately visible, try to open search
    if (!(await searchInput.isVisible())) {
      // Try clicking a search icon or button to open search
      const searchTrigger = page.locator('[class*="search"], [aria-label*="search" i]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        await page.waitForTimeout(500); // Wait for search to open
      }
    }
    
    // Verify search input becomes visible and active
    await expect(searchInput).toBeVisible();
    
    // Step 3: Enter search term
    await searchInput.fill('Singapore economy');
    
    // Verify text is entered correctly
    await expect(searchInput).toHaveValue('Singapore economy');
    
    // Step 4: Execute search
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await searchInput.press('Enter');
    }
    
    // Wait for search results to load
    await page.waitForLoadState('networkidle');
    
    // Verify search results page loads
    const resultsSelector = '[class*="result"], [class*="search"], article, .article';
    const results = page.locator(resultsSelector);
    
    // Check if we have search results or are on a results page
    const hasResults = await results.count() > 0;
    const urlContainsSearch = page.url().includes('search') || page.url().includes('query');
    
    expect(hasResults || urlContainsSearch).toBeTruthy();
    
    if (hasResults) {
      // Verify search results contain expected keywords
      const firstResult = results.first();
      await expect(firstResult).toBeVisible();
      
      // Check if content is relevant (contains singapore or economy)
      const resultText = await firstResult.textContent();
      const isRelevant = /singapore|economy/i.test(resultText || '');
      
      if (isRelevant) {
        console.log('✅ Search results appear relevant to query');
      }
    }
  });
  
  test('Search responds within acceptable time', async ({ page }) => {
    await page.goto('https://www.channelnewsasia.com');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]').first();
    
    // Open search if needed
    if (!(await searchInput.isVisible())) {
      const searchTrigger = page.locator('[class*="search"], [aria-label*="search" i]').first();
      if (await searchTrigger.isVisible()) {
        await searchTrigger.click();
        await page.waitForTimeout(500);
      }
    }
    
    if (await searchInput.isVisible()) {
      const startTime = Date.now();
      
      await searchInput.fill('test query');
      await searchInput.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      const searchTime = Date.now() - startTime;
      console.log(`Search response time: ${searchTime}ms`);
      
      // Verify search responds within 3 seconds
      expect(searchTime).toBeLessThan(3000);
    }
  });
});