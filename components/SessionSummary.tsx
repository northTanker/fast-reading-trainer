"use client";

import { formatTimeLong as formatTime } from "@/lib/formatTime";

interface SessionSummaryProps {
  wordCount: number;
  actualWpm: number;
  durationMs: number;
  onNewSession: () => void;
}

export default function SessionSummary({
  wordCount,
  actualWpm,
  durationMs,
  onNewSession,
  onTakeQuiz,
}: SessionSummaryProps & { onTakeQuiz?: (mode: "default" | "custom") => void }) {
  return (
    <div className="glass-panel flex flex-col gap-8 items-center rounded-3xl p-8 sm:p-10 transition-all duration-500 mt-4 relative overflow-hidden w-full max-w-2xl mx-auto">
      <div className="text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight font-outfit">
          Sesi Selesai!
        </h2>
        <p className="text-sm text-zinc-500 mt-2 font-medium">
          Kerja bagus mempertahankan kecepatan.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full relative z-10">
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {wordCount}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">
            Kata
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 shadow-sm transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-600 dark:text-amber-500 tabular-nums">
            {actualWpm}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-500 mt-1 uppercase tracking-widest">
            Rata WPM
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm transition-all duration-300">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatTime(durationMs)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">
            Waktu
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 relative z-10">
        <button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white hover:from-zinc-800 hover:to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-white dark:hover:to-zinc-200 font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.98] shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
          onClick={onNewSession}
        >
          Mulai Sesi Baru
        </button>

        {onTakeQuiz && !!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY && (
          <button
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-bold text-base transition-all duration-300 active:scale-[0.98]"
            onClick={() => onTakeQuiz("default")}
          >
            Ikuti Tes Pemahaman (Gratis)
          </button>
        )}

        {onTakeQuiz && (
          <button
            className="w-full py-3 rounded-2xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 font-bold text-sm transition-all duration-300"
            onClick={() => onTakeQuiz("custom")}
          >
            Punya API Key Sendiri? Tes di sini
          </button>
        )}
      </div>
    </div>
  );
}
