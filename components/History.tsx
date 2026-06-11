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

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/50 dark:bg-zinc-800/30">
            <tr className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-200/50 dark:border-zinc-800/50">
              <th className="py-3 px-4 text-left font-bold">Tanggal</th>
              <th className="py-3 px-4 text-right font-bold">Kata</th>
              <th className="py-3 px-4 text-right font-bold">Target</th>
              <th className="py-3 px-4 text-right font-bold">Aktual</th>
              <th className="py-3 px-4 text-right font-bold">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {history
              .slice()
              .reverse()
              .map((s, idx) => (
                <tr 
                  key={s.id} 
                  className={`text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-zinc-50/50 dark:bg-zinc-800/20'}`}
                >
                  <td className="py-3 px-4 font-mono text-xs tabular-nums whitespace-nowrap">
                    {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {s.wordCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {s.wpmSetting}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {s.completed ? (
                      <span className="text-amber-600 dark:text-amber-500">{s.actualWpm}</span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {Math.round(s.durationMs / 1000)}s
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

