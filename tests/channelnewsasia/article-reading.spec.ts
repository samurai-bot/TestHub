import { test, expect } from '@playwright/test';

test.describe('Channel News Asia - Article Reading Flow', () => {
  test('Article reading experience is complete and functional', async ({ page }) => {
    const baseURL = 'https://www.channelnewsasia.com';
    
    // Step 1: Navigate to homepage and find an article
    await page.goto(baseURL);
    
    // Look for article links
    const articleLinks = page.locator('a[href*="/news"], a[href*="/singapore"], a[href*="/world"], article a, [class*="headline"] a').first();
    await expect(articleLinks).toBeVisible();
    
    // Click on featured article
    const articleUrl = await articleLinks.getAttribute('href');
    await articleLinks.click();
    
    // Wait for article page to load
    await page.waitForLoadState('networkidle');
    
    // Verify: Article page loads with full content, headline, and byline
    const headline = page.locator('h1, [class*="headline"], [class*="title"]').first();
    await expect(headline).toBeVisible();
    
    const content = page.locator('[class*="content"], [class*="body"], main, article').first();
    await expect(content).toBeVisible();
    
    // Step 2: Scroll through article content
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight);
    });
    
    await page.waitForTimeout(1000);
    
    // Check that images load properly if present
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      
      // Verify image has loaded (has natural dimensions)
      const hasLoaded = await firstImage.evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalHeight !== 0;
      });
      
      if (hasLoaded) {
        console.log('✅ Article images loaded successfully');
      }
    }
    
    // Step 3: Look for social sharing buttons
    const socialShare = page.locator(
      '[class*="share"], [class*="social"], a[href*="facebook.com/sharer"], a[href*="twitter.com/intent"], a[href*="linkedin.com/sharing"]'
    );
    
    const shareCount = await socialShare.count();
    if (shareCount > 0) {
      console.log('✅ Social sharing options found');
      await expect(socialShare.first()).toBeVisible();
    }
    
    // Step 4: Check for related articles section
    const relatedArticles = page.locator(
      '[class*="related"], [class*="recommended"], [class*="more"], [class*="similar"]'
    );
    
    const relatedCount = await relatedArticles.count();
    if (relatedCount > 0) {
      console.log('✅ Related articles section found');
      
      // Check if related articles have links
      const relatedLinks = page.locator('[class*="related"] a, [class*="recommended"] a');
      const linkCount = await relatedLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
    
    // Step 5: Look for comment section
    const commentSection = page.locator(
      '[class*="comment"], [class*="discussion"], [id*="comment"]'
    );
    
    const commentCount = await commentSection.count();
    if (commentCount > 0) {
      console.log('✅ Comment section detected');
    }
  });
  
  test('Article page performance is acceptable', async ({ page }) => {
    await page.goto('https://www.channelnewsasia.com');
    
    // Find and click an article
    const articleLink = page.locator('a[href*="/news"], article a').first();
    
    if (await articleLink.isVisible()) {
      const startTime = Date.now();
      
      await articleLink.click();
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`Article load time: ${loadTime}ms`);
      
      // Verify article loads within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      
      // Check that the article content is substantial
      const content = page.locator('[class*="content"], [class*="body"], main');
      const contentText = await content.textContent();
      const wordCount = (contentText || '').split(/\s+/).length;
      
      // Expect articles to have reasonable content
      expect(wordCount).toBeGreaterThan(50);
    }
  });
});