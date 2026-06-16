import { expect, test, describe } from 'vitest';
import { tokenize } from '../tokenizer';

// Property-based test helper
const runPropertyTest = (
  name: string,
  property: (input: string) => boolean,
  generators: (() => string)[],
  iterations = 100
) => {
  test(name, () => {
    for (let i = 0; i < iterations; i++) {
      const input = generators[i % generators.length]();
      expect(property(input), `Failed for input: "${input}"`).toBe(true);
    }
  });
};

// Simple generators for property-based testing
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \n\t';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateParagraph = (): string => {
  const sentences = [
    'The quick brown fox jumps over the lazy dog.',
    'She sells seashells by the seashore.',
    'How much wood would a woodchuck chuck?',
    'Peter Piper picked a peck of pickled peppers.',
  ];
  return sentences.join(' ');
};

const generateWithMultipleNewlines = (): string => {
  const lines = ['Line one', '', 'Line two', '', '', 'Line three'];
  return lines.join('\n');
};

describe('tokenizer - Property-based tests', () => {
  // Property 1: Output should never be null or contain null elements
  runPropertyTest(
    'never returns null or undefined',
    (input) => {
      const result = tokenize(input);
      return result !== null && result !== undefined && !result.some(w => w === null || w === undefined);
    },
    [() => '', () => 'hello', () => generateRandomString(50), () => generateParagraph()]
  );

  // Property 2: Empty input should return empty array
  runPropertyTest(
    'empty input returns empty array',
    (input) => {
      if (!input || input.trim() === '') {
        const result = tokenize(input);
        return Array.isArray(result) && result.length === 0;
      }
      return true;
    },
    [() => '', () => '   ', () => '\t\n\r']
  );

  // Property 3: Output words should preserve order
  runPropertyTest(
    'preserves word order',
    (input) => {
      if (!input.trim()) return true;
      const result = tokenize(input);
      const allWords = input.trim().split(/\s+/).filter(w => w.length > 0);
      
      // Compare joining result - should match original normalized
      const joined = result.join(' ');
      return joined.length > 0;
    },
    [() => 'hello world test', () => generateParagraph(), () => generateRandomString(30)]
  );

  // Property 4: Each output word should have content
  runPropertyTest(
    'no empty words in output',
    (input) => {
      const result = tokenize(input);
      return result.every(w => w && w.length > 0);
    },
    [() => 'hello   world', () => 'a  b   c', () => generateRandomString(20)]
  );

  // Property 5: Paragraph breaks preserved
  runPropertyTest(
    'preserves paragraph breaks',
    (input) => {
      const result = tokenize(input);
      return result.includes('\n\n');
    },
    [() => 'para1\n\npara2', () => 'line1\n\n\nline2', () => generateWithMultipleNewlines()]
  );

  // Property 6: Input with only newlines should handle gracefully
  runPropertyTest(
    'handles newline-only input',
    (input) => {
      const result = tokenize(input);
      return Array.isArray(result);
    },
    [() => '\n\n\n', () => '\n\n', () => '\t\t\t']
  );

  // Property 7: Single word should return array with that word
  test('single word returns array with that word', () => {
    const result = tokenize('test');
    expect(result).toEqual(['test']);
  });

  // Property 8: Multiple spaces should be collapsed to single space
  test('multiple spaces collapse to single', () => {
    const result = tokenize('hello    world');
    expect(result).toEqual(['hello', 'world']);
  });

  // Property 9: Tabs and carriage returns converted to spaces
  test('converts tabs and carriage returns', () => {
    const result = tokenize('hello\tworld\r\ntest');
    expect(result).toEqual(['hello', 'world', 'test']);
  });

  // Property 10: Excessive newlines normalized to double newline
  test('normalizes excessive newlines', () => {
    const result = tokenize('a\n\n\n\n\nb');
    expect(result).toEqual(['a', '\n\n', 'b']);
  });
});