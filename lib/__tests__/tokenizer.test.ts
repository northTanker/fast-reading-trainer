import { expect, test, describe } from 'vitest';
import { tokenize } from '../tokenizer';

describe('tokenizer', () => {
  test('splits simple sentence into words', () => {
    expect(tokenize('Hello world this is a test')).toEqual(['Hello', 'world', 'this', 'is', 'a', 'test']);
  });

  test('handles multiple spaces', () => {
    expect(tokenize('Hello    world')).toEqual(['Hello', 'world']);
  });

  test('handles newlines and tabs', () => {
    expect(tokenize('Hello\nworld\tthis\r\nis\n\n\nfine')).toEqual(['Hello', 'world', 'this', 'is', 'fine']);
  });

  test('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });
});
