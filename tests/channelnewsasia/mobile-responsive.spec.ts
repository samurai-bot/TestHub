import { test, expect } from '@playwright/test';

test.describe('Channel News Asia - Mobile Responsiveness', () => {
  test('Website displays correctly on mobile devices', async ({ page }) => {
    // Step 1: Set browser viewport to mobile size (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('https://www.channelnewsasia.com');
    await page.waitForLoadState('networkidle');
    
    // Verify: Page layout adapts to mobile screen size
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that page content fits within mobile viewport
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20); // Allow small margin for scrollbars
    
    // Step 2: Test hamburger menu functionality
    const hamburgerMenu = page.locator(
      '[class*="hamburger"], [class*="menu-toggle"], [class*="mobile-menu"], [aria-label*="menu" i]'
    );
    
    const hamburgerCount = await hamburgerMenu.count();
    if (hamburgerCount > 0) {
      const menuButton = hamburgerMenu.first();
      await expect(menuButton).toBeVisible();
      
      // Test menu open/close
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Check if menu drawer or dropdown appeared
      const mobileNav = page.locator('[class*="mobile-nav"], [class*="drawer"], nav[class*="open"]');
      const mobileNavCount = await mobileNav.count();
      
      if (mobileNavCount > 0) {
        await expect(mobileNav.first()).toBeVisible();
        console.log('✅ Mobile menu opens correctly');
        
        // Try to close the menu
        await menuButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Step 3: Verify touch interactions work properly
    const firstLink = page.locator('a').first();
    await expect(firstLink).toBeVisible();
    
    // Test tap interaction
    const linkHref = await firstLink.getAttribute('href');
    if (linkHref && !linkHref.startsWith('javascript:')) {
      // Simulate touch tap
      await firstLink.tap();
      await page.waitForTimeout(1000);
      console.log('✅ Touch interaction responsive');
    }
    
    // Step 4: Check text readability without horizontal scrolling
    const textElements = page.locator('p, h1, h2, h3, span');
    const textCount = await textElements.count();
    
    if (textCount > 0) {
      for (let i = 0; i < Math.min(textCount, 3); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            // Text should not exceed viewport width
            expect(boundingBox.width).toBeLessThanOrEqual(375);
          }
        }
      }
      console.log('✅ Text content fits within mobile viewport');
    }
  });
  
  test('Website works correctly on tablet view', async ({ page }) => {
    // Step 5: Test tablet view (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('https://www.channelnewsasia.com');
    await page.waitForLoadState('networkidle');
    
    // Verify: Layout adjusts appropriately for tablet screen size
    const body = page.locator('body');
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768 + 20);
    
    // Check that navigation is appropriate for tablet
    const navigation = page.locator('nav, [role="navigation"]');
    const navCount = await navigation.count();
    
    if (navCount > 0) {
      await expect(navigation.first()).toBeVisible();
      
      // On tablet, navigation might be different from mobile
      const navWidth = await navigation.first().boundingBox();
      if (navWidth) {
        expect(navWidth.width).toBeLessThanOrEqual(768);
      }
    }
    
    // Test orientation change simulation
    await page.setViewportSize({ width: 1024, height: 768 }); // Landscape
    await page.waitForTimeout(1000);
    
    // Verify page still works in landscape
    await expect(body).toBeVisible();
    
    const landscapeWidth = await body.evaluate(el => el.scrollWidth);
    expect(landscapeWidth).toBeLessThanOrEqual(1024 + 20);
    
    console.log('✅ Tablet responsiveness verified');
  });
  
  test('Mobile performance is acceptable', async ({ page }) => {
    // Simulate slower mobile connection
    await page.route('**/*', route => {
      // Add small delay to simulate mobile network
      setTimeout(() => route.continue(), 100);
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('https://www.channelnewsasia.com');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Mobile load time: ${loadTime}ms`);
    
    // Mobile should load within 6 seconds even with slower connection
    expect(loadTime).toBeLessThan(6000);
  });
});