"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { SessionState } from "@/types";
import { tokenize } from "@/lib/tokenizer";

interface UseReaderOptions {
  text: string;
  initialWpm: number;
  onFinish: (durationMs: number, completed: boolean) => void;
}

interface UseReaderReturn {
  sessionState: SessionState;
  words: string[];
  wordIndex: number;
  wpm: number;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setWpm: (wpm: number) => void;
  skipForward: (count?: number) => void;
  skipBack: (count?: number) => void;
}

export function useReader({
  text,
  initialWpm,
  onFinish,
}: UseReaderOptions): UseReaderReturn {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const words = useMemo(() => tokenize(text), [text]);
  const [wordIndex, setWordIndex] = useState(0);
  const [wpm, setWpmState] = useState(initialWpm);

  const wpmRef = useRef(initialWpm);
  const wordIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const nextDelayRef = useRef<number>(0);

  const startTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);
  const hasFinishedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const calculateDelay = useCallback((word: string) => {
    const baseIntervalMs = Math.max(20, Math.round(60000 / wpmRef.current));
    if (!word) return baseIntervalMs;
    
    const isEndOfSentence = /[.!?]["']?$/.test(word);
    const isPausePunctuation = /[,;:]["']?$/.test(word);
    const isLongWord = word.length > 8;

    let multiplier = 1;
    if (isEndOfSentence) multiplier = 2; // 2x delay untuk akhir kalimat
    else if (isPausePunctuation) multiplier = 1.5; // 1.5x delay untuk koma/jeda
    else if (isLongWord) multiplier = 1.2; // 1.2x delay untuk kata panjang

    return baseIntervalMs * multiplier;
  }, []);

  const loop = useCallback(function tickLoop(time: number) {
    if (lastTickRef.current === 0) {
      lastTickRef.current = time;
    }

    const elapsed = time - lastTickRef.current;
    if (elapsed >= nextDelayRef.current) {
      const next = wordIndexRef.current + 1;
      if (next >= words.length) {
        clearTimer();
        hasFinishedRef.current = true;
        setSessionState("finished");
        const end = performance.now();
        const duration = end - startTimeRef.current - totalPausedRef.current;
        onFinish(duration, true);
        return;
      }

      wordIndexRef.current = next;
      setWordIndex(next);
      
      // Hitung jeda untuk kata saat ini
      const currentWord = words[next];
      nextDelayRef.current = calculateDelay(currentWord);
      
      // Simpan sisa waktu agar rAF tidak drift
      lastTickRef.current = time - (elapsed - nextDelayRef.current);
    }

    rafRef.current = requestAnimationFrame(tickLoop);
  }, [words, clearTimer, onFinish, calculateDelay]);

  const startTimer = useCallback(() => {
    clearTimer();
    lastTickRef.current = 0;
    
    // Set delay awal untuk kata pertama
    const currentWord = words[wordIndexRef.current];
    nextDelayRef.current = calculateDelay(currentWord);
    
    rafRef.current = requestAnimationFrame(loop);
  }, [clearTimer, loop, calculateDelay, words]);

  const start = useCallback(() => {
    if (words.length === 0 || sessionState === "reading") return;
    wordIndexRef.current = 0;
    setWordIndex(0);
    hasFinishedRef.current = false;
    startTimeRef.current = performance.now();
    pauseStartRef.current = 0;
    totalPausedRef.current = 0;
    setSessionState("reading");
    startTimer();
  }, [words.length, sessionState, startTimer]);

  const pause = useCallback(() => {
    if (sessionState !== "reading") return;
    clearTimer();
    pauseStartRef.current = performance.now();
    setSessionState("paused");
  }, [sessionState, clearTimer]);

  const resume = useCallback(() => {
    if (sessionState !== "paused") return;
    totalPausedRef.current += performance.now() - pauseStartRef.current;
    setSessionState("reading");
    startTimer();
  }, [sessionState, startTimer]);

  const stop = useCallback(() => {
    clearTimer();
    const end = performance.now();
    if (sessionState === "paused") {
      totalPausedRef.current += end - pauseStartRef.current;
    }
    const duration = end - startTimeRef.current - totalPausedRef.current;
    setSessionState("finished");
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true;
      onFinish(duration, false);
    }
  }, [clearTimer, onFinish, sessionState]);

  const setWpm = useCallback(
    (newWpm: number) => {
      const clamped = Math.max(50, Math.min(1000, newWpm));
      wpmRef.current = clamped;
      setWpmState(clamped);
      
      // Update delay segera
      if (words[wordIndexRef.current]) {
         nextDelayRef.current = calculateDelay(words[wordIndexRef.current]);
      }
    },
    [words, calculateDelay]
  );

  const skipForward = useCallback(
    (count = 1) => {
      const next = Math.min(wordIndexRef.current + count, words.length - 1);
      wordIndexRef.current = next;
      setWordIndex(next);
      if (words[next]) nextDelayRef.current = calculateDelay(words[next]);
    },
    [words, calculateDelay]
  );

  const skipBack = useCallback((count = 1) => {
    const prev = Math.max(wordIndexRef.current - count, 0);
    wordIndexRef.current = prev;
    setWordIndex(prev);
    if (words[prev]) nextDelayRef.current = calculateDelay(words[prev]);
  }, [words, calculateDelay]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && sessionState === "reading") {
        pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [sessionState, pause]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = words.length > 0 ? (wordIndex + 1) / words.length : 0;

  return {
    sessionState,
    words,
    wordIndex,
    wpm,
    progress,
    start,
    pause,
    resume,
    stop,
    setWpm,
    skipForward,
    skipBack,
  };
}
