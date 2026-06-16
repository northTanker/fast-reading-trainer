"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { GamificationData } from "@/types";
import { getHistory, saveGamificationData } from "@/lib/storage";
import { computeGamification, BADGES } from "@/lib/gamification";
import { Trophy, Flame, Timer, BookOpen, Star, Lock } from "lucide-react";

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
      <div className="relative flex flex-col gap-4 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 dark:from-amber-500/20 dark:to-rose-600/10 border border-amber-500/30 dark:border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)] overflow-hidden">
        <Trophy className="absolute -top-10 -right-10 w-48 h-48 text-amber-500 opacity-10 blur-sm pointer-events-none" />
        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-500 drop-shadow-md" />
              <div className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                Level Pembaca
              </div>
            </div>
            <div className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums leading-none drop-shadow-sm">
              Level {data.level}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400 tabular-nums leading-none drop-shadow-sm">
              {data.xp.toLocaleString()} XP
            </div>
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1.5">
              Butuh {nextLevelXp.toLocaleString()} XP lagi
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 w-full bg-white/50 dark:bg-zinc-900/50 rounded-full overflow-hidden mt-2 shadow-inner border border-white/20 dark:border-zinc-800/50 relative z-10">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)] relative"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full">
        <div className="group flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/5 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40">
          <Flame className="w-6 h-6 mb-1 text-amber-500 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-500 tabular-nums leading-none">
            {data.currentStreak}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1.5 uppercase tracking-widest">
            Rekor Hari
          </div>
        </div>

        <div className="group flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600">
          <Timer className="w-6 h-6 mb-1 text-zinc-600 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
            {data.totalSessions}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1.5 uppercase tracking-widest">
            Total Sesi
          </div>
        </div>

        <div className="group flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600">
          <BookOpen className="w-6 h-6 mb-1 text-zinc-600 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
            {data.totalWordsRead.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1.5 uppercase tracking-widest">
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
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                  unlocked
                    ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/5 text-zinc-900 dark:text-zinc-100 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_25px_-5px_rgba(245,158,11,0.3)] hover:-translate-y-1 hover:border-amber-400/60"
                    : "border-zinc-200/50 bg-white/40 text-zinc-400 dark:border-zinc-800/50 dark:bg-zinc-800/20 dark:text-zinc-600 opacity-60"
                } backdrop-blur-sm relative overflow-hidden`}
              >
                <div className={`relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-500 ${unlocked ? 'bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-500/30 dark:to-orange-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-12' : 'bg-zinc-100 dark:bg-zinc-800/50'}`}>
                  {unlocked && <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-pulse" />}
                  {unlocked ? (
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500 drop-shadow-sm" />
                  ) : (
                    <Lock className="w-5 h-5 text-zinc-400 dark:text-zinc-500 drop-shadow-sm opacity-50" />
                  )}
                </div>
                <div className="flex flex-col relative z-10">
                  <span className="text-sm font-extrabold leading-tight mb-0.5 tracking-tight">
                    {badge.label}
                  </span>
                  <span className={`text-xs font-medium ${unlocked ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
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

