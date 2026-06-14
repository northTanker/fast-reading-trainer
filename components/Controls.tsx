"use client";

import { memo } from "react";
import type { SessionState } from "@/types";

interface ControlsProps {
  sessionState: SessionState;
  wpm: number;
  progress: number;
  wordIndex: number;
  totalWords: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onWpmChange: (wpm: number) => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
}

export default memo(function Controls({
  sessionState,
  wpm,
  progress,
  wordIndex,
  totalWords,
  onPlay,
  onPause,
  onResume,
  onStop,
  onWpmChange,
  onSkipForward,
  onSkipBack,
}: ControlsProps) {
  const isIdle = sessionState === "idle";
  const isReading = sessionState === "reading";
  const isPaused = sessionState === "paused";
  const isFinished = sessionState === "finished";

  return (
    <div className="glass-panel flex flex-col gap-6 w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl transition-all duration-500">
      <div className="flex items-center gap-4">
        {isIdle && (
          <button
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white hover:from-zinc-800 hover:to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-white dark:hover:to-zinc-200 font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            onClick={onPlay}
          >
            Mulai
          </button>
        )}
        {isReading && (
          <button
            className="flex-1 py-3 px-6 rounded-2xl bg-white/50 hover:bg-white border border-zinc-200/50 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:border-zinc-700/50 text-zinc-900 dark:text-white font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            onClick={onPause}
          >
            Jeda
          </button>
        )}
        {isPaused && (
          <button
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white hover:from-zinc-800 hover:to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-white dark:hover:to-zinc-200 font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            onClick={onResume}
          >
            Lanjutkan
          </button>
        )}
        {isFinished && (
          <button
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white hover:from-zinc-800 hover:to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-white dark:hover:to-zinc-200 font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            onClick={onPlay}
          >
            Ulangi
          </button>
        )}

        {(isReading || isPaused) && (
          <button
            className="py-3 px-6 rounded-2xl border border-red-200/50 bg-red-50/50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            onClick={onStop}
          >
            Akhiri
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-3 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
          onClick={onSkipBack}
          disabled={isIdle}
          title="Mundur 1 kata"
          aria-label="Skip backward 1 word"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m-7 7h16" />
          </svg>
        </button>

        <button
          className="p-3 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
          onClick={onSkipForward}
          disabled={isIdle}
          title="Maju 1 kata"
          aria-label="Skip forward 1 word"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        <div 
          className="flex-1 h-3 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 overflow-hidden border border-zinc-300/30 dark:border-zinc-700/30 shadow-inner"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <span className="text-xs font-medium text-zinc-500 tabular-nums w-20 text-right font-mono" aria-live="polite">
          {wordIndex + 1}/{totalWords}
        </span>
      </div>

      <div className="flex items-center gap-4 px-2">
        <label htmlFor="wpm-slider" className="text-xs font-bold text-zinc-500 uppercase tracking-widest w-10">
          WPM
        </label>
        <input
          id="wpm-slider"
          type="range"
          min={50}
          max={1000}
          step={10}
          value={wpm}
          onChange={(e) => onWpmChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none bg-zinc-200/50 dark:bg-zinc-800/50 cursor-pointer accent-amber-500 border border-zinc-300/50 dark:border-zinc-700/50 shadow-inner"
          aria-label="Words per minute setting"
        />
        <span className="text-base text-zinc-900 dark:text-zinc-100 tabular-nums w-12 text-right font-mono font-bold" aria-live="polite">
          {wpm}
        </span>
      </div>
    </div>
  );
});
