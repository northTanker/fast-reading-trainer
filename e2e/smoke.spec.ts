import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Check main elements are visible
    await expect(page.getByText('BacaKilat')).toBeVisible();
    await expect(page.getByPlaceholder(/Ketik atau tempel teks di sini/i)).toBeVisible();
    await expect(page.getByText(/Mulai Baca/i)).toBeVisible();
  });

  test('should have skip navigation link', async ({ page }) => {
    await page.goto('/');
    
    // Skip link should be visible on focus
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /Lewati ke konten utama/i });
    await expect(skipLink).toBeFocused();
  });

  test('should have proper landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
    
    // Check for header
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});