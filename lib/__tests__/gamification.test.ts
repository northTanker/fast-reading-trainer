import { expect, test, describe, beforeEach } from 'vitest';
import { computeGamification, BADGES } from '../gamification';
import type { SessionRecord } from '@/types';

describe('gamification', () => {
  const createSession = (overrides: Partial<SessionRecord> = {}): SessionRecord => ({
    id: 'test-' + Math.random(),
    date: new Date().toISOString(),
    textPreview: 'Test text...',
    wordCount: 100,
    wpmSetting: 200,
    actualWpm: 180,
    durationMs: 60000,
    completed: true,
    source: 'manual',
    title: 'Test',
    ...overrides,
  });

  describe('computeGamification', () => {
    test('returns zero values for empty history', () => {
      const result = computeGamification([]);
      
      expect(result.totalSessions).toBe(0);
      expect(result.totalWordsRead).toBe(0);
      expect(result.bestWpm).toBe(0);
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.xp).toBe(0);
      expect(result.level).toBe(1);
      expect(result.unlockedBadges).toEqual([]);
    });

    test('calculates total sessions correctly', () => {
      const history = [
        createSession({ wordCount: 100 }),
        createSession({ wordCount: 150 }),
        createSession({ wordCount: 200 }),
      ];
      
      const result = computeGamification(history);
      expect(result.totalSessions).toBe(3);
    });

    test('calculates total words read correctly', () => {
      const history = [
        createSession({ wordCount: 100 }),
        createSession({ wordCount: 150 }),
        createSession({ wordCount: 200 }),
      ];
      
      const result = computeGamification(history);
      expect(result.totalWordsRead).toBe(450);
    });

    test('calculates best WPM from completed sessions only', () => {
      const history = [
        createSession({ actualWpm: 150, completed: true }),
        createSession({ actualWpm: 200, completed: false }), // incomplete
        createSession({ actualWpm: 180, completed: true }),
      ];
      
      const result = computeGamification(history);
      expect(result.bestWpm).toBe(180); // not 200 (incomplete)
    });

    test('calculates XP correctly', () => {
      const history = [
        createSession({ wordCount: 100, quizScore: 80 }),
        createSession({ wordCount: 200, quizScore: 100 }),
      ];
      
      const result = computeGamification(history);
      // Base: 100 + 200 = 300 XP
      // Quiz bonus: 80/2 + 100/2 = 40 + 50 = 90 XP
      // Session bonus: 2 * 50 = 100 XP
      // Total: 300 + 90 + 100 = 490 XP
      expect(result.xp).toBe(490);
    });

    test('calculates level from XP', () => {
      const history = [
        createSession({ wordCount: 2500 }),
      ];
      
      const result = computeGamification(history);
      // Base XP: 2500 + 50 (session) = 2550
      // Level: floor(2550/1000) + 1 = 3
      expect(result.level).toBe(3);
    });

    describe('streak calculation', () => {
      test('calculates current streak for consecutive days', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const history = [
          createSession({ date: today.toISOString() }),
          createSession({ date: yesterday.toISOString() }),
        ];
        
        const result = computeGamification(history);
        expect(result.currentStreak).toBe(2);
      });

      test('calculates longest streak correctly', () => {
        const dates = [
          '2024-01-01',
          '2024-01-02',
          '2024-01-03',
          '2024-01-05', // skip
          '2024-01-06',
          '2024-01-07',
        ];
        
        const history = dates.map((date) => createSession({ date }));
        const result = computeGamification(history);
        
        expect(result.longestStreak).toBe(3); // 1-2-3 is longest
      });
    });

    describe('badge unlocking', () => {
      test('unlocks first_session badge after 1 session', () => {
        const history = [createSession()];
        const result = computeGamification(history);
        
        expect(result.unlockedBadges).toContain('first_session');
      });

      test('unlocks multiple session badges', () => {
        const history = Array(10).fill(null).map(() => createSession());
        const result = computeGamification(history);
        
        expect(result.unlockedBadges).toContain('first_session');
        expect(result.unlockedBadges).toContain('five_sessions');
        expect(result.unlockedBadges).toContain('ten_sessions');
      });

      test('unlocks WPM badges based on bestWpm', () => {
        const history = [
          createSession({ actualWpm: 250, completed: true }),
        ];
        const result = computeGamification(history);
        
        expect(result.unlockedBadges).toContain('wpm_200');
        expect(result.unlockedBadges).toContain('wpm_250');
        expect(result.unlockedBadges).not.toContain('wpm_300');
      });

      test('unlocks words read badges', () => {
        const history = [
          createSession({ wordCount: 5500 }),
        ];
        const result = computeGamification(history);
        
        expect(result.unlockedBadges).toContain('words_1000');
        expect(result.unlockedBadges).toContain('words_5000');
        expect(result.unlockedBadges).not.toContain('words_25000');
      });

      test('unlocks source-based badges', () => {
        const history = [
          createSession({ source: 'catalog' }),
          createSession({ source: 'catalog' }),
          createSession({ source: 'catalog' }),
          createSession({ source: 'catalog' }),
          createSession({ source: 'catalog' }),
          createSession({ source: 'ai' }),
          createSession({ source: 'ai' }),
          createSession({ source: 'ai' }),
        ];
        const result = computeGamification(history);
        
        expect(result.unlockedBadges).toContain('catalog_fan');
        expect(result.unlockedBadges).toContain('ai_explorer');
      });

      test('unlocks critical_thinker badge for 100% quiz score', () => {
        const history = [
          createSession({ quizScore: 80 }),
          createSession({ quizScore: 100 }),
        ];
        const result = computeGamification(history);
        
        expect(result.unlockedBadges).toContain('critical_thinker');
      });
    });
  });

  describe('BADGES', () => {
    test('all badges have required fields', () => {
      BADGES.forEach((badge) => {
        expect(badge.id).toBeDefined();
        expect(badge.label).toBeDefined();
        expect(badge.description).toBeDefined();
        expect(badge.check).toBeDefined();
        expect(typeof badge.check).toBe('function');
      });
    });

    test('all badge IDs are unique', () => {
      const ids = BADGES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});