"use client";

import { useEffect } from "react";
import { BADGES } from "@/lib/gamification";

interface AchievementToastProps {
  badgeIds: string[];
  onClose: () => void;
}

export default function AchievementToast({ badgeIds, onClose }: AchievementToastProps) {
  useEffect(() => {
    if (badgeIds.length > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [badgeIds, onClose]);

  if (badgeIds.length === 0) return null;

  const badges = badgeIds.map(id => BADGES.find(b => b.id === id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
      {/* Backdrop animation */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto" onClick={onClose} />
      
      <div className="relative flex flex-col gap-4 pointer-events-auto z-10 w-full max-w-sm">
        {badges.map((badge, idx) => (
          <div 
            key={badge?.id || idx}
            className="w-full bg-white dark:bg-zinc-900 border-2 border-amber-400 dark:border-amber-500 rounded-2xl p-5 shadow-2xl animate-in zoom-in-90 slide-in-from-bottom-10 fade-in duration-500 flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={onClose}
            style={{ animationDelay: `${idx * 200}ms`, animationFillMode: 'both' }}
          >
            <div className="flex-shrink-0 w-14 h-14 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-3xl animate-bounce">🌟</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-0.5">
                Pencapaian Baru!
              </span>
              <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                {badge?.label}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                {badge?.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
