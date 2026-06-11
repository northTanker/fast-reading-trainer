"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { GamificationData } from "@/types";
import { getHistory, saveGamificationData } from "@/lib/storage";
import { computeGamification, BADGES } from "@/lib/gamification";

let cachedGamData: GamificationData | null = null;
let cachedGamRaw: string | null = null;

function getGamSnapshot(): GamificationData | null {
  const raw = localStorage.getItem("reading-history");
  if (!raw) return null;

  if (cachedGamRaw === raw && cachedGamData) {
    return cachedGamData;
  }

  const history = getHistory();
  if (!Array.isArray(history) || history.length === 0) return null;

  cachedGamRaw = raw;
  cachedGamData = computeGamification(history);
  return cachedGamData;
}

function getServerSnapshot(): GamificationData | null {
  return null;
}

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function Gamification() {
  const data = useSyncExternalStore(subscribe, getGamSnapshot, getServerSnapshot);

  // Side effect: persist gamification data outside of snapshot
  useEffect(() => {
    if (data) {
      saveGamificationData(data);
    }
  }, [data]);

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full">
        <div className="flex flex-col items-center justify-center bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-600 dark:text-amber-500 tabular-nums">
            {data.currentStreak}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">
            Rekor Hari
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {data.totalSessions}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">
            Sesi
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {data.totalWordsRead.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">
            Kata Dibaca
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
          <h3 className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">
            Pencapaian
          </h3>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const unlocked = data.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={badge.description}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                  unlocked
                    ? "border-amber-500/30 bg-amber-500/10 text-zinc-900 dark:text-zinc-100 hover:scale-105 hover:shadow-lg"
                    : "border-zinc-200/50 bg-white/50 text-zinc-400 dark:border-zinc-800/50 dark:bg-zinc-800/30 dark:text-zinc-600 grayscale opacity-70"
                } backdrop-blur-sm shadow-sm`}
              >
                <span className={`text-2xl ${unlocked ? "text-amber-500" : ""}`}>
                  {unlocked ? "🌟" : "⭐"}
                </span>
                <span className="text-xs font-medium text-center leading-tight">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

