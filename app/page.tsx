"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import TextInput from "@/components/TextInput";
import Reader from "@/components/Reader";
import Controls from "@/components/Controls";
import ProgressPanel from "@/components/ProgressPanel";
import SessionSummary from "@/components/SessionSummary";
import Gamification from "@/components/Gamification";
import History from "@/components/History";
import AnalyticsChart from "@/components/AnalyticsChart";
import QuizPanel from "@/components/QuizPanel";
import { useReader } from "@/hooks/useReader";
import { tokenize } from "@/lib/tokenizer";
import { createSessionRecord } from "@/lib/session";
import { saveSession } from "@/lib/storage";
import type { SessionRecord } from "@/types";

export default function Home() {
  const [text, setText] = useState("");
  const [currentWpm, setCurrentWpm] = useState(200);
  const [showInput, setShowInput] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null);
  const [gamificationKey, setGamificationKey] = useState(0);
  const [historyKey, setHistoryKey] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState<"default" | "custom" | false>(false);

  const elapsedAccumulatedRef = useRef(0);
  const elapsedStartRef = useRef(0);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = useMemo(() => tokenize(text).length, [text]);

  const handleFinish = useCallback(
    (durationMs: number, completed: boolean) => {
      const words = tokenize(text);
      const record = createSessionRecord({
        text,
        words,
        wpmSetting: currentWpm,
        durationMs,
        completed,
      });
      saveSession(record);
      setLastSession(record);
      setGamificationKey((k) => k + 1);
      setHistoryKey((k) => k + 1);

      if (elapsedIntervalRef.current !== null) {
        clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
    },
    [text, currentWpm]
  );

  const reader = useReader({
    text,
    initialWpm: currentWpm,
    onFinish: handleFinish,
  });

  const startElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current !== null) return;
    elapsedAccumulatedRef.current = 0;
    setElapsedMs(0);
    elapsedStartRef.current = performance.now();
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedMs(
        elapsedAccumulatedRef.current + (performance.now() - elapsedStartRef.current)
      );
    }, 50);
  }, []);

  const pauseElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current !== null) {
      // Accumulate time before clearing
      elapsedAccumulatedRef.current += performance.now() - elapsedStartRef.current;
      setElapsedMs(elapsedAccumulatedRef.current);
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  const resumeElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current !== null) return;
    elapsedStartRef.current = performance.now();
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedMs(
        elapsedAccumulatedRef.current + (performance.now() - elapsedStartRef.current)
      );
    }, 50);
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  const handleStart = useCallback(() => {
    setShowInput(false);
    setLastSession(null);
    setCountdown(3);

    // Countdown: 3 → 2 → 1 → start
    let count = 3;
    const tick = () => {
      count--;
      if (count > 0) {
        setCountdown(count);
        countdownTimerRef.current = setTimeout(tick, 700);
      } else {
        setCountdown(null);
        reader.start();
        startElapsedTimer();
      }
    };
    countdownTimerRef.current = setTimeout(tick, 700);
  }, [reader, startElapsedTimer]);

  const handlePause = useCallback(() => {
    reader.pause();
    pauseElapsedTimer();
  }, [reader, pauseElapsedTimer]);

  const handleResume = useCallback(() => {
    reader.resume();
    resumeElapsedTimer();
  }, [reader, resumeElapsedTimer]);

  const handleStop = useCallback(() => {
    reader.stop();
    pauseElapsedTimer();
  }, [reader, pauseElapsedTimer]);

  const handleNewSession = useCallback(() => {
    setShowInput(true);
    setQuizMode(false);
    setLastSession(null);
    setText("");
    setElapsedMs(0);
    elapsedAccumulatedRef.current = 0;
  }, []);

  const handleTakeQuiz = useCallback((mode: "default" | "custom") => {
    setQuizMode(mode);
  }, []);

  const handleCloseQuiz = useCallback(() => {
    setQuizMode(false);
    handleNewSession();
  }, [handleNewSession]);

  const handleWpmChange = useCallback(
    (wpm: number) => {
      setCurrentWpm(wpm);
      reader.setWpm(wpm);
    },
    [reader]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (reader.sessionState === "reading") handlePause();
          else if (reader.sessionState === "paused") handleResume();
          break;
        case "Escape":
          e.preventDefault();
          if (reader.sessionState === "reading" || reader.sessionState === "paused") {
            handleStop();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (
            reader.sessionState === "reading" ||
            reader.sessionState === "paused"
          ) {
            reader.skipForward(1);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (
            reader.sessionState === "reading" ||
            reader.sessionState === "paused"
          ) {
            reader.skipBack(1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reader.sessionState, handlePause, handleResume, handleStop, reader]);

  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current !== null) {
        clearInterval(elapsedIntervalRef.current);
      }
      clearCountdown();
    };
  }, [clearCountdown]);

  const isActive = reader.sessionState === "reading" || reader.sessionState === "paused";

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8 sm:py-12 min-h-screen">
      {showInput ? (
        <div className="flex flex-col gap-10 w-full max-w-2xl relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-3 mb-2">
              <span className="text-4xl sm:text-5xl">⚡</span>
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter font-outfit bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent pb-2 drop-shadow-sm">
                BacaKilat
              </h1>
            </div>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg mx-auto font-medium">
              Evolusi cara Anda menyerap informasi. Capai <span className="text-amber-500 font-bold">500+ WPM</span> dengan teknologi Optimal Recognition Point.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <TextInput
              text={text}
              onChange={setText}
              onStart={handleStart}
              wordCount={wordCount}
              wpm={currentWpm}
              onWpmChange={handleWpmChange}
              disabled={false}
            />
          </div>

          <div className="space-y-8">
            <div key={`gamification-${gamificationKey}`} className="glass-panel rounded-3xl p-6 sm:p-8">
              <Gamification />
            </div>
            
            <div key={`analytics-${historyKey}`} className="glass-panel rounded-3xl p-6 sm:p-8">
              <AnalyticsChart />
            </div>

            <div key={`history-${historyKey}`} className="glass-panel rounded-3xl p-6 sm:p-8">
              <History />
            </div>

            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                Mengapa Aplikasi Ini Dibuat?
              </h3>
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  Seringkali kita kesulitan fokus atau terjebak dalam kebiasaan membaca sambil &quot;menggumam&quot; dalam hati (subvokalisasi). Hal ini memperlambat kecepatan membaca kita secara drastis.
                </p>
                <p>
                  Aplikasi ini dikembangkan untuk memecahkan masalah tersebut dengan teknologi <strong>RSVP (Rapid Serial Visual Presentation)</strong> dan <strong>ORP (Optimal Recognition Point)</strong>. Dengan menyorot titik fokus spesifik pada setiap kata dan menampilkannya satu per satu, mata Anda tidak perlu repot-repot bergerak dari kiri ke kanan.
                </p>
                <p>
                  Hasilnya? Anda bisa menyerap informasi jauh lebih cepat, mengurangi kelelahan mata, dan melatih otak memutus kebiasaan subvokalisasi. Aplikasi ini bersifat 100% aman (privasi teks dijamin karena diproses secara lokal di peramban Anda) dan bisa diunduh sebagai aplikasi luring (offline) kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : quizMode ? (
        <div className="w-full relative z-10 flex flex-col items-center">
          <QuizPanel text={text} initialMode={quizMode} onClose={handleCloseQuiz} />
        </div>
      ) : (
        <div className="flex flex-col gap-8 w-full max-w-2xl relative z-10">
          <div className="glass-panel rounded-3xl p-6 shadow-sm transition-all duration-500">
            <ProgressPanel
              wpm={currentWpm}
              wordIndex={reader.wordIndex}
              totalWords={reader.words.length}
              elapsedMs={elapsedMs}
              sessionState={reader.sessionState}
            />
          </div>
          {countdown !== null ? (
            <div className="flex items-center justify-center w-full min-h-[40vh] select-none">
              <span className="text-8xl sm:text-9xl font-mono font-bold text-amber-400 animate-pulse tabular-nums">
                {countdown}
              </span>
            </div>
          ) : (
            <Reader
              word={
                reader.sessionState === "idle"
                  ? "Siap"
                  : reader.sessionState === "finished"
                  ? "Selesai"
                  : reader.words[reader.wordIndex] ?? ""
              }
              isPaused={reader.sessionState === "paused"}
              isFinished={reader.sessionState === "finished"}
            />
          )}

          {reader.sessionState === "finished" && lastSession ? (
            <SessionSummary
              wordCount={lastSession.wordCount}
              actualWpm={lastSession.actualWpm}
              durationMs={lastSession.durationMs}
              onNewSession={handleNewSession}
              onTakeQuiz={handleTakeQuiz}
            />
          ) : countdown === null ? (
            <Controls
              sessionState={reader.sessionState}
              wpm={currentWpm}
              progress={reader.progress}
              wordIndex={reader.wordIndex}
              totalWords={reader.words.length}
              onPlay={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onWpmChange={handleWpmChange}
              onSkipForward={() => reader.skipForward(1)}
              onSkipBack={() => reader.skipBack(1)}
            />
          ) : null}

          {isActive && (
            <p className="text-center text-xs text-zinc-600">
              Spasi untuk jeda/lanjut &middot; Panah untuk lewati &middot; Esc untuk akhiri sesi
            </p>
          )}
        </div>
      )}
    </div>
  );
}

