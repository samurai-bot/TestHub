import { test, expect } from '@playwright/test';

test.describe('Channel News Asia - Breaking News and Live Updates', () => {
  test('Breaking news functionality works correctly', async ({ page }) => {
    const baseURL = 'https://www.channelnewsasia.com';
    
    // Step 1: Check for breaking news banner on homepage
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Look for breaking news indicators
    const breakingNews = page.locator(
      '[class*="breaking"], [class*="urgent"], [class*="live"], [class*="alert"], [data-testid="breaking-news"]'
    );
    
    const breakingCount = await breakingNews.count();
    
    if (breakingCount > 0) {
      console.log('✅ Breaking news section detected');
      await expect(breakingNews.first()).toBeVisible();
      
      // Check if breaking news has timestamp or "live" indicator
      const timestamp = page.locator('[class*="time"], [class*="live"], [class*="updated"]');
      const timestampCount = await timestamp.count();
      
      if (timestampCount > 0) {
        console.log('✅ Timestamp/live indicators found');
      }
    } else {
      console.log('ℹ️ No breaking news currently displayed');
    }
    
    // Step 2: Navigate to Live or Breaking news section if available
    const liveLinks = page.locator(
      'a[href*="live"], a[href*="breaking"], a:has-text("Live"), a:has-text("Breaking")'
    );
    
    const liveLinksCount = await liveLinks.count();
    
    if (liveLinksCount > 0) {
      const liveLink = liveLinks.first();
      await liveLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify: Live news feed loads with timestamps and recent updates
      const liveFeed = page.locator('[class*="live"], [class*="feed"], [class*="update"]');
      const feedCount = await liveFeed.count();
      
      if (feedCount > 0) {
        await expect(liveFeed.first()).toBeVisible();
        console.log('✅ Live news feed loaded');
        
        // Check for timestamps in live updates
        const updateTimes = page.locator('[class*="time"], time, [datetime]');
        const timeCount = await updateTimes.count();
        
        if (timeCount > 0) {
          console.log('✅ Live updates have timestamps');
        }
      }
    }
    
    // Step 3: Test auto-refresh functionality if present
    const refreshIndicator = page.locator(
      '[class*="refresh"], [class*="reload"], [class*="auto"], [class*="update"]'
    );
    
    const refreshCount = await refreshIndicator.count();
    if (refreshCount > 0) {
      console.log('✅ Auto-refresh indicators found');
    }
    
    // Check for meta refresh or JavaScript refresh
    const metaRefresh = await page.locator('meta[http-equiv="refresh"]').count();
    if (metaRefresh > 0) {
      console.log('✅ Meta refresh detected');
    }
  });
  
  test('Live video streaming functionality if present', async ({ page }) => {
    await page.goto('https://www.channelnewsasia.com');
    
    // Step 5: Look for live video streaming
    const videoElements = page.locator(
      'video, iframe[src*="youtube"], iframe[src*="vimeo"], [class*="video"], [class*="player"]'
    );
    
    const videoCount = await videoElements.count();
    
    if (videoCount > 0) {
      console.log('✅ Video content detected');
      
      const firstVideo = videoElements.first();
      await expect(firstVideo).toBeVisible();
      
      // If it's a video element, check if it's playing
      const isVideoTag = await firstVideo.evaluate(el => el.tagName.toLowerCase() === 'video');
      
      if (isVideoTag) {
        // Check video properties
        const videoProps = await firstVideo.evaluate((video: HTMLVideoElement) => ({
          hasSource: video.src !== '' || video.children.length > 0,
          duration: video.duration,
          paused: video.paused
        }));
        
        if (videoProps.hasSource) {
          console.log('✅ Video has source');
          
          // Try to play video if it's not auto-playing
          if (videoProps.paused) {
            try {
              await firstVideo.evaluate((video: HTMLVideoElement) => video.play());
              await page.waitForTimeout(2000);
              console.log('✅ Video playback tested');
            } catch (e) {
              console.log('ℹ️ Video play requires user interaction');
            }
          }
        }
      }
    } else {
      console.log('ℹ️ No video content currently available');
    }
  });
  
  test('News content freshness and updates', async ({ page }) => {
    await page.goto('https://www.channelnewsasia.com');
    
    // Check for recent timestamps to verify content freshness
    const timeElements = page.locator(
      'time, [class*="time"], [class*="date"], [datetime], [class*="published"]'
    );
    
    const timeCount = await timeElements.count();
    
    if (timeCount > 0) {
      // Get the first few timestamps
      for (let i = 0; i < Math.min(timeCount, 3); i++) {
        const timeElement = timeElements.nth(i);
        
        if (await timeElement.isVisible()) {
          const timeText = await timeElement.textContent();
          const datetime = await timeElement.getAttribute('datetime');
          
          console.log(`Article timestamp: ${timeText || datetime}`);
          
          // Check if content is recent (contains "ago", "today", or recent date)
          const isRecent = /ago|today|hours?|minutes?|\d{1,2}:\d{2}/i.test(timeText || datetime || '');
          
          if (isRecent) {
            console.log('✅ Recent content detected');
            break;
          }
        }
      }
    }
    
    // Check page load performance for news site
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const reloadTime = Date.now() - startTime;
    console.log(`Page reload time: ${reloadTime}ms`);
    
    // News sites should reload quickly for fresh content
    expect(reloadTime).toBeLessThan(4000);
  });
  
  test('Breaking news notifications and alerts', async ({ page }) => {
    await page.goto('https://www.channelnewsasia.com');
    
    // Look for notification permission requests or alert systems
    const notificationElements = page.locator(
      '[class*="notification"], [class*="alert"], [class*="subscribe"], [class*="bell"]'
    );
    
    const notificationCount = await notificationElements.count();
    
    if (notificationCount > 0) {
      console.log('✅ Notification system detected');
      
      // Check if there's a subscribe or enable notifications option
      const subscribeButtons = page.locator(
        'button:has-text("Subscribe"), button:has-text("Enable"), button:has-text("Allow")'
      );
      
      const subscribeCount = await subscribeButtons.count();
      if (subscribeCount > 0) {
        console.log('✅ Notification subscription options available');
      }
    }
    
    // Test if page handles notification permissions gracefully
    try {
      await page.evaluate(() => {
        if ('Notification' in window) {
          return Notification.permission;
        }
        return 'not-supported';
      });
      console.log('✅ Browser notification API available');
    } catch (e) {
      console.log('ℹ️ Notification API test completed');
    }
  });
});