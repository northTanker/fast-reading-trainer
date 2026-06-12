import { expect, test, describe } from 'vitest';
import { getOrpIndex, splitAtOrp } from '../orp';

describe('orp', () => {
  describe('getOrpIndex', () => {
    test('returns 0 for short words', () => {
      expect(getOrpIndex('I')).toBe(0);
      expect(getOrpIndex('a')).toBe(0);
    });

    test('calculates correct index using lookup table', () => {
      expect(getOrpIndex('Hello')).toBe(2); // length 5 -> index 2
      expect(getOrpIndex('testing')).toBe(3); // length 7 -> index 3
    });

    test('ignores punctuation in length calculation', () => {
      expect(getOrpIndex('Hello,')).toBe(2); // 5 letters
    });
  });

  describe('splitAtOrp', () => {
    test('splits at the correct pivot', () => {
      expect(splitAtOrp('Hello')).toEqual({ before: 'He', pivot: 'l', after: 'lo' });
      expect(splitAtOrp('testing')).toEqual({ before: 'tes', pivot: 't', after: 'ing' });
    });

    test('handles punctuation', () => {
      expect(splitAtOrp('"Hello"')).toEqual({ before: '"He', pivot: 'l', after: 'lo"' });
    });

    test('handles short words', () => {
      expect(splitAtOrp('I')).toEqual({ before: '', pivot: 'I', after: '' });
      expect(splitAtOrp('to')).toEqual({ before: '', pivot: 'to', after: '' });
    });
  });
});
