import { test, expect } from '@playwright/test';

test.describe('RSVP Reading Flow', () => {
  test('should complete a reading session from start to finish', async ({ page }) => {
    await page.goto('/');
    
    // 1. Enter text in textarea
    const textarea = page.getByPlaceholder(/Ketik atau tempel teks di sini/i);
    await textarea.fill('Ini adalah teks prueba untuk membaca dengan cepat.');
    
    // 2. Click start button
    const startButton = page.getByRole('button', { name: /Mulai Baca/i });
    await startButton.click();
    
    // 3. Wait for countdown
    await expect(page.getByText(/^[1-3]$/)).toBeVisible({ timeout: 5000 });
    
    // 4. Wait for reading to finish (text is short so it should finish quickly)
    await expect(page.getByText('Selesai')).toBeVisible({ timeout: 30000 });
    
    // 5. Check session summary appears
    await expect(page.getByText(/Kata:/i)).toBeVisible();
    await expect(page.getByText(/WPM:/i)).toBeVisible();
  });

  test('should pause and resume reading', async ({ page }) => {
    await page.goto('/');
    
    // Enter text
    const textarea = page.getByPlaceholder(/Ketik atau tempel teks di sini/i);
    await textarea.fill('Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh.');
    
    // Start reading
    const startButton = page.getByRole('button', { name: /Mulai Baca/i });
    await startButton.click();
    
    // Wait for countdown to finish
    await page.waitForTimeout(4000);
    
    // Click pause button
    const pauseButton = page.getByRole('button', { name: /Jeda/i });
    await pauseButton.click();
    
    // Verify paused state - word should not change
    const wordBefore = await page.locator('[class*="text-amber-500"]').textContent();
    await page.waitForTimeout(1000);
    const wordAfter = await page.locator('[class*="text-amber-500"]').textContent();
    expect(wordBefore).toBe(wordAfter);
    
    // Click resume button
    const resumeButton = page.getByRole('button', { name: /Lanjutkan/i });
    await resumeButton.click();
    
    // Verify reading resumed - word should change
    await page.waitForTimeout(500);
    const wordAfterResume = await page.locator('[class*="text-amber-500"]').textContent();
    expect(wordAfterResume).not.toBe(wordAfter);
  });

  test('should stop reading and return to input', async ({ page }) => {
    await page.goto('/');
    
    // Enter text
    const textarea = page.getByPlaceholder(/Ketik atau tempel teks di sini/i);
    await textarea.fill('Teks pendek untuk pengujian.');
    
    // Start reading
    const startButton = page.getByRole('button', { name: /Mulai Baca/i });
    await startButton.click();
    
    // Wait for countdown
    await page.waitForTimeout(4000);
    
    // Press Escape to stop
    await page.keyboard.press('Escape');
    
    // Verify returned to input state
    await expect(page.getByText(/Mulai Baca/i)).toBeVisible();
  });

  test('should adjust WPM during reading', async ({ page }) => {
    await page.goto('/');
    
    // Enter text
    const textarea = page.getByPlaceholder(/Ketik atau tempel teks di sini/i);
    await textarea.fill('Satu dua tiga empat lima enam tujuh delapan.');
    
    // Start reading
    const startButton = page.getByRole('button', { name: /Mulai Baca/i });
    await startButton.click();
    
    // Wait for countdown
    await page.waitForTimeout(4000);
    
    // Change WPM using slider
    const wpmSlider = page.locator('#wpm-slider');
    await wpmSlider.fill('500');
    
    // Verify WPM changed
    await expect(page.getByText('500 WPM')).toBeVisible();
  });

  test('should skip forward and backward', async ({ page }) => {
    await page.goto('/');
    
    // Enter text
    const textarea = page.getByPlaceholder(/Ketik atau tempel teks di sini/i);
    await textarea.fill('Satu dua tiga empat lima enam tujuh delapan.');
    
    // Start reading
    const startButton = page.getByRole('button', { name: /Mulai Baca/i });
    await startButton.click();
    
    // Wait for countdown
    await page.waitForTimeout(4000);
    
    // Check initial word index (should be around 1-2)
    const wordIndexBefore = await page.getByText(/\d+\/\d+/).textContent();
    
    // Skip forward
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    
    // Verify word index increased
    const wordIndexAfter = await page.getByText(/\d+\/\d+/).textContent();
    expect(wordIndexAfter).not.toBe(wordIndexBefore);
    
    // Skip backward
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    
    // Verify word index decreased (or same if at start)
    const wordIndexFinal = await page.getByText(/\d+\/\d+/).textContent();
    expect(wordIndexFinal).toBe(wordIndexBefore);
  });
});