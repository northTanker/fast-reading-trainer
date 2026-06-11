import { expect, test, describe } from 'vitest';
import { getOrpIndex, splitAtOrp } from '../orp';

describe('orp', () => {
  describe('getOrpIndex', () => {
    test('returns 0 for short words', () => {
      expect(getOrpIndex('I')).toBe(0);
      expect(getOrpIndex('a')).toBe(0);
    });

    test('calculates ~35% index for longer words', () => {
      expect(getOrpIndex('Hello')).toBe(1); // 5 * 0.35 = 1.75 -> 1
      expect(getOrpIndex('testing')).toBe(2); // 7 * 0.35 = 2.45 -> 2
    });

    test('ignores punctuation in length calculation', () => {
      expect(getOrpIndex('Hello,')).toBe(1); // 5 letters
    });
  });

  describe('splitAtOrp', () => {
    test('splits at the correct pivot', () => {
      expect(splitAtOrp('Hello')).toEqual({ before: 'H', pivot: 'e', after: 'llo' });
      expect(splitAtOrp('testing')).toEqual({ before: 'te', pivot: 's', after: 'ting' });
    });

    test('handles punctuation', () => {
      expect(splitAtOrp('"Hello"')).toEqual({ before: '"H', pivot: 'e', after: 'llo"' });
    });

    test('handles short words', () => {
      expect(splitAtOrp('I')).toEqual({ before: '', pivot: 'I', after: '' });
      expect(splitAtOrp('to')).toEqual({ before: '', pivot: 'to', after: '' });
    });
  });
});
