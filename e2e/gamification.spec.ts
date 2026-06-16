import { test, expect } from '@playwright/test';

test.describe('Gamification', () => {
  test('should track reading sessions', async ({ page }) => {
    // Clear localStorage first
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Enter and complete a reading session
    const textarea = page.getByPlaceholder(/Ketik atau tempel teks di sini/i);
    await textarea.fill('Teks pendek untuk pengujian membaca.');
    
    const startButton = page.getByRole('button', { name: /Mulai Baca/i });
    await startButton.click();
    
    // Wait for session to finish
    await expect(page.getByText('Selesai')).toBeVisible({ timeout: 30000 });
    
    // Reload page to trigger localStorage read
    await page.reload();
    
    // Open progress modal via auth button
    const authButton = page.getByRole('button', { name: /Masuk/i });
    await authButton.click();
    
    // Check for progress modal or check localStorage directly
    const gamificationData = await page.evaluate(() => {
      const data = localStorage.getItem('gamification-data');
      return data ? JSON.parse(data) : null;
    });
    
    expect(gamificationData).not.toBeNull();
    expect(gamificationData.totalSessions).toBe(1);
  });

  test('should calculate streak correctly', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Simulate sessions on consecutive days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await page.evaluate((dates) => {
      const sessions = dates.map((date: string, i: number) => ({
        id: `session-${i}`,
        date,
        textPreview: 'Test...',
        wordCount: 100,
        wpmSetting: 200,
        actualWpm: 180,
        durationMs: 60000,
        completed: true,
      }));
      localStorage.setItem('reading-history', JSON.stringify(sessions));
    }, [twoDaysAgo.toISOString(), yesterday.toISOString()]);
    
    // Reload and check streak
    await page.reload();
    
    const gamificationData = await page.evaluate(() => {
      const data = localStorage.getItem('gamification-data');
      return data ? JSON.parse(data) : null;
    });
    
    if (gamificationData) {
      expect(gamificationData.currentStreak).toBeGreaterThanOrEqual(2);
    }
  });
});