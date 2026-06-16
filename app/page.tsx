"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import TextInput from "@/components/TextInput";
import Reader from "@/components/Reader";
import Controls from "@/components/Controls";
import ProgressPanel from "@/components/ProgressPanel";
import SessionSummary from "@/components/SessionSummary";
import ThemeToggle from "@/components/ThemeToggle";
import FeedbackButton from "@/components/FeedbackButton";
import DonationButton from "@/components/DonationButton";
import QuizPanel from "@/components/QuizPanel";
import AchievementToast from "@/components/AchievementToast";

const AuthButton = dynamic(() => import("@/components/AuthButton"), { ssr: false });
const BigAuthButton = dynamic(() => import("@/components/BigAuthButton"), { ssr: false });
const EduModal = dynamic(() => import("@/components/EduModal"), { ssr: false });
const LibraryModal = dynamic(() => import("@/components/LibraryModal"), { ssr: false });
const ProgressModal = dynamic(() => import("@/components/ProgressModal"), { ssr: false });
import { useReader } from "@/hooks/useReader";
import { tokenize } from "@/lib/tokenizer";
import { createSessionRecord } from "@/lib/session";
import { getHistory, saveSession, updateLatestSessionQuizScore } from "@/lib/storage";
import { computeGamification } from "@/lib/gamification";
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
  const [showEduModal, setShowEduModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [textSource, setTextSource] = useState<"manual" | "catalog" | "ai">("manual");
  const [textTitle, setTextTitle] = useState<string | undefined>(undefined);
  const [scrolled, setScrolled] = useState(false);

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
        source: textSource,
        title: textTitle,
      });
      const oldHistory = getHistory();
      const oldGamification = computeGamification(oldHistory);
      
      saveSession(record);
      
      const newHistory = getHistory();
      const newGamification = computeGamification(newHistory);
      
      const newlyUnlocked = newGamification.unlockedBadges.filter(
        (id) => !oldGamification.unlockedBadges.includes(id)
      );

      if (newlyUnlocked.length > 0) {
        setUnlockedBadges(newlyUnlocked);
      }

      setLastSession(record);
      setGamificationKey((k) => k + 1);
      setHistoryKey((k) => k + 1);

      if (elapsedIntervalRef.current !== null) {
        clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
    },
    [text, currentWpm, textSource, textTitle]
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
    }, 1000);
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
    }, 1000);
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  const readerStart = reader.start;
  const readerPause = reader.pause;
  const readerResume = reader.resume;
  const readerStop = reader.stop;

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
        readerStart();
        startElapsedTimer();
      }
    };
    countdownTimerRef.current = setTimeout(tick, 700);
  }, [readerStart, startElapsedTimer]);

  const handlePause = useCallback(() => {
    readerPause();
    pauseElapsedTimer();
  }, [readerPause, pauseElapsedTimer]);

  const handleResume = useCallback(() => {
    readerResume();
    resumeElapsedTimer();
  }, [readerResume, resumeElapsedTimer]);

  const handleStop = useCallback(() => {
    readerStop();
    pauseElapsedTimer();
  }, [readerStop, pauseElapsedTimer]);

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

  const handleCloseQuiz = useCallback((scorePercentage?: number) => {
    if (scorePercentage !== undefined) {
      updateLatestSessionQuizScore(scorePercentage);
      // Re-trigger gamification and history refresh
      setGamificationKey((k) => k + 1);
      setHistoryKey((k) => k + 1);
      
      // Check if critical_thinker badge was unlocked
      const newHistory = getHistory();
      const newGamification = computeGamification(newHistory);
      const newlyUnlocked = newGamification.unlockedBadges.filter(
        (id) => !unlockedBadges.includes(id)
      );
      if (newlyUnlocked.length > 0) {
        setUnlockedBadges((prev) => [...prev, ...newlyUnlocked]);
      }
    }
    setQuizMode(false);
    handleNewSession();
  }, [handleNewSession, unlockedBadges]);

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className={`flex flex-col flex-1 items-center px-4 min-h-screen relative transition-colors duration-1000 ${isActive ? 'bg-zinc-50 dark:bg-black' : ''}`}>
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded-lg focus:font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        Lewati ke konten utama
      </a>

      <header className={`sticky top-0 z-50 w-full max-w-5xl mx-auto flex justify-between items-center py-4 px-4 sm:px-8 transition-all duration-500 bg-transparent backdrop-blur-lg ${isActive ? 'opacity-0 pointer-events-none -translate-y-10' : 'opacity-100 hover:opacity-100'}`}>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="BacaKilat Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-zinc-100 dark:bg-white p-1.5 rounded-xl" 
          />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tighter font-outfit bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
            BacaKilat
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <AuthButton 
            onCheckProgress={() => setShowProgressModal(true)} 
            onOpenLibrary={() => setShowLibraryModal(true)}
          />
        </div>
      </header>

      <main id="main-content" className="flex flex-col flex-1 items-center justify-center w-full mt-4 sm:mt-0 pb-12">
      <EduModal 
        isOpen={showEduModal}
        onClose={() => setShowEduModal(false)}
      />
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        gamificationKey={gamificationKey}
        historyKey={historyKey}
      />
      <LibraryModal 
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelectText={(txt, title, source) => {
          setText(txt);
          setTextTitle(title);
          setTextSource(source || "ai");
          setShowInput(true);
        }}
      />
      {showInput ? (
        <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-2xl relative z-10">
          <div className="text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Logo Desktop (Sembunyi di Mobile) */}
            <div className={`hidden sm:inline-flex items-center justify-center space-x-4 mb-2 transition-all duration-500 ${scrolled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="BacaKilat Logo" 
                className="w-16 h-16 object-contain bg-zinc-100 dark:bg-white p-2 rounded-2xl shadow-lg dark:shadow-amber-500/20" 
              />
              <h1 className="text-7xl font-extrabold tracking-tighter font-outfit bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent pb-2 drop-shadow-sm">
                BacaKilat
              </h1>
            </div>
            
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg mx-auto font-medium mb-6 leading-relaxed">
              Baca lebih cepat tanpa kehilangan makna. Tembus <span className="text-amber-500 font-bold">500+ WPM</span> pakai metode Optimal Recognition Point.
            </p>
            
            <button
              onClick={() => setShowEduModal(true)}
              className="px-5 py-2 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 rounded-full font-bold text-sm transition-all shadow-sm flex items-center gap-2 mb-4"
            >
              <span>📚</span>
              <span>Pelajari Caranya</span>
            </button>
            <BigAuthButton />
          </div>

          <div className="glass-panel rounded-3xl p-4 sm:p-8">
            <TextInput
              text={text}
              onChange={setText}
              onStart={handleStart}
              wordCount={wordCount}
              wpm={currentWpm}
              onWpmChange={handleWpmChange}
              disabled={false}
              onSourceChange={(source, title) => {
                setTextSource(source);
                setTextTitle(title);
              }}
            />
          </div>
        </div>
      ) : quizMode ? (
        <div className="w-full relative z-10 flex flex-col items-center">
          <QuizPanel text={text} initialMode={quizMode} onClose={handleCloseQuiz} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-2xl relative z-10">
          <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-sm transition-all duration-500">
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
              session={lastSession}
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
      </main>
      <footer className={`w-full max-w-5xl mx-auto flex flex-col justify-center items-center gap-4 py-8 sm:py-6 px-4 mt-auto transition-all duration-500 ${isActive ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Saran & Kritik</span>
            <FeedbackButton />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Dukung Kami</span>
            <DonationButton />
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium text-center">
          &copy; {new Date().getFullYear()} Edwigar Annas Akbar
        </p>
      </footer>
      <AchievementToast badgeIds={unlockedBadges} onClose={() => setUnlockedBadges([])} />
    </div>
  );
}

