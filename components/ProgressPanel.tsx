"use client";

import { memo } from "react";
import { formatTimeShort as formatTime } from "@/lib/formatTime";

interface ProgressPanelProps {
  wpm: number;
  wordIndex: number;
  totalWords: number;
  elapsedMs: number;
  sessionState: string;
}
export default memo(function ProgressPanel({
  wpm,
  wordIndex,
  totalWords,
  elapsedMs,
  sessionState,
}: ProgressPanelProps) {
  const isActive = sessionState === "reading" || sessionState === "paused";

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full" role="group" aria-label="Session Progress">
      <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300">
        <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums" role="timer" aria-live="off">
          {isActive ? formatTime(elapsedMs) : "--:--"}
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 mt-1 uppercase tracking-widest">
          Waktu
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300">
        <div className="text-xl sm:text-2xl font-mono font-bold text-amber-600 dark:text-amber-500 tabular-nums">
          {wpm}
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 mt-1 uppercase tracking-widest">
          WPM
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300">
        <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
          {isActive ? wordIndex + 1 : 0}
          <span className="text-zinc-500 dark:text-zinc-600 text-sm sm:text-base font-medium">/{totalWords}</span>
        </div>
        <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 mt-1 uppercase tracking-widest">
          Kata
        </div>
      </div>
    </div>
  );
});
