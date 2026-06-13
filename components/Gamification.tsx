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

  const xpProgress = (data.xp % 1000) / 1000 * 100;
  const nextLevelXp = 1000 - (data.xp % 1000);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">
              Level Pembaca
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
              Level {data.level}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-amber-600 dark:text-amber-500 tabular-nums leading-none">
              {data.xp.toLocaleString()} XP
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Butuh {nextLevelXp.toLocaleString()} XP lagi
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const unlocked = data.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                  unlocked
                    ? "border-amber-500/30 bg-amber-500/5 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "border-zinc-200/50 bg-white/50 text-zinc-400 dark:border-zinc-800/50 dark:bg-zinc-800/30 dark:text-zinc-600 grayscale opacity-70"
                } backdrop-blur-sm`}
              >
                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${unlocked ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                  <span className={`text-2xl ${unlocked ? "text-amber-500" : ""}`}>
                    {unlocked ? "🌟" : "🔒"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight mb-0.5">
                    {badge.label}
                  </span>
                  <span className={`text-xs ${unlocked ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {badge.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

