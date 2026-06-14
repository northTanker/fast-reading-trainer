"use client";

import { useSyncExternalStore } from "react";
import type { SessionRecord } from "@/types";
import { clearHistory } from "@/lib/storage";

const EMPTY_HISTORY: SessionRecord[] = [];
let cachedHistory: SessionRecord[] = EMPTY_HISTORY;
let cachedHistoryRaw: string | null = null;

function getSnapshot(): SessionRecord[] {
  const raw = localStorage.getItem("reading-history");
  if (!raw) return EMPTY_HISTORY;

  if (cachedHistoryRaw === raw) {
    return cachedHistory;
  }

  try {
    const parsed = JSON.parse(raw);
    cachedHistoryRaw = raw;
    cachedHistory = Array.isArray(parsed) ? parsed : EMPTY_HISTORY;
    return cachedHistory;
  } catch {
    return EMPTY_HISTORY;
  }
}

function getServerSnapshot(): SessionRecord[] {
  return EMPTY_HISTORY;
}

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function History() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (history.length === 0) return null;

  const handleClear = () => {
    if (!window.confirm("Hapus semua riwayat sesi? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    clearHistory();
    cachedHistoryRaw = null;
    cachedHistory = [];
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Riwayat Sesi
        </h3>
        <button
          className="text-xs px-4 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all duration-200 active:scale-95 font-medium"
          onClick={handleClear}
        >
          Hapus Riwayat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {history
          .slice()
          .reverse()
          .map((s) => {
            const getSourceIcon = () => {
              if (s.source === "ai") return "🤖";
              if (s.source === "catalog") return "📚";
              return "✏️";
            };

            const getSourceLabel = () => {
              if (s.source === "ai") return "AI Generated";
              if (s.source === "catalog") return "Katalog";
              return "Manual";
            };

            return (
              <div 
                key={s.id} 
                className="flex flex-col gap-3 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/30"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span title={getSourceLabel()} className="text-lg">{getSourceIcon()}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {s.title || "Teks Kustom"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-xs text-zinc-400">
                      {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {s.quizScore !== undefined && (
                    <span className={`shrink-0 inline-flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-bold ${
                      s.quizScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      s.quizScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {s.quizScore}% Kuis
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Kata</span>
                    <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{s.wordCount}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">WPM Aktual</span>
                    <div className="font-mono">
                      {s.completed ? (
                        <span>
                          <span className="font-bold text-amber-600 dark:text-amber-500">{s.actualWpm}</span>
                          <span className="text-xs text-zinc-400 ml-1">/{s.wpmSetting}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">&mdash;</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

