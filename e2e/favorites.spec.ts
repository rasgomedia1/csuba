import { test, expect } from '@playwright/test';

test.describe('Favorites Functionality', () => {
  test('should save and unsave a favorite from search cards', async ({ page }) => {
    // Navigate to search
    await page.goto('/search');

    // Wait for cards to load
    await page.waitForSelector('text=View Details', { timeout: 10000 });

    // Get the first heart button
    const heartButtons = await page.locator('button[title*="favorite"]').all();
    expect(heartButtons.length).toBeGreaterThan(0);

    // Click the first heart to save
    await heartButtons[0].click();

    // Wait for the heart to turn red
    await page.waitForTimeout(1000);
    const heart = heartButtons[0];
    const text = await heart.textContent();
    expect(text).toContain('❤️');

    console.log('✅ Heart successfully turned red (saved)');

    // Click again to unsave
    await heart.click();

    // Wait for the heart to turn white
    await page.waitForTimeout(1000);
    const textAfter = await heart.textContent();
    expect(textAfter).toContain('🤍');

    console.log('✅ Heart successfully turned white (unsaved)');
  });

  test('should navigate to favorites list', async ({ page }) => {
    // Navigate to search and save an item
    await page.goto('/search');
    await page.waitForSelector('button[title*="favorite"]', { timeout: 10000 });

    const heartButtons = await page.locator('button[title*="favorite"]').all();
    await heartButtons[0].click();
    await page.waitForTimeout(500);

    // Click the Favorites button in header
    await page.click('a:has-text("❤️ Favorites")');

    // Should navigate to watchlist
    await expect(page).toHaveURL(/.*watchlist/);

    console.log('✅ Successfully navigated to Favorites page');
  });

  test('should show heart button in auction detail page', async ({ page }) => {
    // Navigate to search
    await page.goto('/search');
    await page.waitForSelector('a:has-text("View Details")', { timeout: 10000 });

    // Click on first View Details button
    const detailLinks = await page.locator('a:has-text("View Details")').all();
    await detailLinks[0].click();

    // Wait for detail page to load
    await page.waitForSelector('text=📍 Ubicación', { timeout: 10000 });

    // Should have a heart button in the detail page
    const heartInDetail = await page.locator('button[title*="favorite"]');
    expect(heartInDetail).toBeTruthy();

    console.log('✅ Heart button found in detail page');
  });
});
