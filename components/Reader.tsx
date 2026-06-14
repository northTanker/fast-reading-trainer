"use client";

import { memo } from "react";
import { splitAtOrp } from "@/lib/orp";

interface ReaderProps {
  word: string;
  isPaused: boolean;
  isFinished: boolean;
}

export default memo(function Reader({ word, isPaused, isFinished }: ReaderProps) {
  const { before, pivot, after } = splitAtOrp(word);

  return (
    <div 
      className="flex items-center justify-center w-full min-h-[40vh] select-none px-4"
      role="region"
      aria-label="Speed Reading Pane"
    >
      <div
        className={`relative flex items-center justify-center transition-all duration-300 ${
          isPaused ? "opacity-30 scale-95 blur-[2px]" : "opacity-100 scale-100 blur-0"
        }`}
        aria-hidden="true"
      >
        <span className="font-outfit font-bold text-4xl sm:text-6xl md:text-7xl text-zinc-900 dark:text-zinc-100 tracking-tight break-words max-w-full text-center drop-shadow-sm">
          <span className="text-zinc-400 dark:text-zinc-500 transition-colors duration-75">{before}</span>
          <span className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-colors duration-75 relative">
            {pivot}
            {/* Guide line under pivot */}
            {!isFinished && word && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500/50" />
            )}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 transition-colors duration-75">{after}</span>
        </span>

        {isFinished && (
          <span className="ml-4 text-4xl sm:text-5xl md:text-6xl text-amber-400 animate-pulse">
            &#10003;
          </span>
        )}
      </div>
      
      {/* Screen reader only announcement of the current word */}
      <span className="sr-only" aria-live="off">
        {word}
      </span>
    </div>
  );
});
