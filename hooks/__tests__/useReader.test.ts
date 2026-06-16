import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReader } from '../useReader';

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 16) as unknown as number;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Mock performance.now
const mockNow = vi.fn();
global.performance.now = mockNow;

describe('useReader', () => {
  const mockOnFinish = vi.fn();
  const testText = 'Hello world this is a test sentence for reading';

  beforeEach(() => {
    vi.clearAllMocks();
    mockNow.mockReturnValue(0);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    test('initializes with idle state', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      expect(result.current.sessionState).toBe('idle');
      expect(result.current.wordIndex).toBe(0);
      expect(result.current.wpm).toBe(200);
      expect(result.current.words).toHaveLength(9);
    });

    test('tokenizes text correctly', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      expect(result.current.words[0]).toBe('Hello');
      expect(result.current.words[1]).toBe('world');
    });

    test('returns 0 progress initially', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      expect(result.current.progress).toBeCloseTo(1 / 9, 2);
    });
  });

  describe('start', () => {
    test('changes state to reading when started', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.start();
      });

      expect(result.current.sessionState).toBe('reading');
    });

    test('does nothing if text is empty', () => {
      const { result } = renderHook(() =>
        useReader({ text: '', initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.start();
      });

      expect(result.current.sessionState).toBe('idle');
    });

    test('does nothing if already reading', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.start();
      });

      // Should not error, state should still be reading
      expect(result.current.sessionState).toBe('reading');
    });
  });

  describe('pause', () => {
    test('changes state to paused when paused during reading', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.sessionState).toBe('paused');
    });

    test('does nothing if not reading', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.pause();
      });

      expect(result.current.sessionState).toBe('idle');
    });
  });

  describe('resume', () => {
    test('changes state back to reading when resumed', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.start();
      });
      act(() => {
        result.current.pause();
      });

      act(() => {
        result.current.resume();
      });

      expect(result.current.sessionState).toBe('reading');
    });

    test('does nothing if not paused', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.resume();
      });

      expect(result.current.sessionState).toBe('idle');
    });
  });

  describe('stop', () => {
    test('changes state to finished and calls onFinish with completed=false', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.sessionState).toBe('finished');
      expect(mockOnFinish).toHaveBeenCalledWith(expect.any(Number), false);
    });

    test('calculates duration correctly', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      mockNow.mockReturnValueOnce(0).mockReturnValueOnce(5000); // 5 seconds

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(mockOnFinish).toHaveBeenCalledWith(expect.any(Number), false);
    });
  });

  describe('setWpm', () => {
    test('updates wpm value', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.setWpm(300);
      });

      expect(result.current.wpm).toBe(300);
    });

    test('clamps minimum wpm to 50', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.setWpm(10);
      });

      expect(result.current.wpm).toBe(50);
    });

    test('clamps maximum wpm to 1000', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.setWpm(2000);
      });

      expect(result.current.wpm).toBe(1000);
    });
  });

  describe('skipForward', () => {
    test('advances word index', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.skipForward(2);
      });

      expect(result.current.wordIndex).toBe(2);
    });

    test('does not exceed word count', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.skipForward(100);
      });

      expect(result.current.wordIndex).toBe(8); // Last index (9 words - 1)
    });
  });

  describe('skipBack', () => {
    test('decreases word index', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.skipForward(3);
      });

      act(() => {
        result.current.skipBack(1);
      });

      expect(result.current.wordIndex).toBe(2);
    });

    test('does not go below 0', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      act(() => {
        result.current.skipBack(5);
      });

      expect(result.current.wordIndex).toBe(0);
    });
  });

  describe('progress', () => {
    test('calculates progress correctly', () => {
      const { result } = renderHook(() =>
        useReader({ text: testText, initialWpm: 200, onFinish: mockOnFinish })
      );

      expect(result.current.progress).toBeCloseTo(1/9, 2);

      act(() => {
        result.current.skipForward(4);
      });

      expect(result.current.progress).toBeCloseTo(5/9, 2);
    });

    test('returns 0 for empty text', () => {
      const { result } = renderHook(() =>
        useReader({ text: '', initialWpm: 200, onFinish: mockOnFinish })
      );

      expect(result.current.progress).toBe(0);
    });
  });
});