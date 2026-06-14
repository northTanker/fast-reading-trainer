"use client";

import { useEffect } from "react";
import Gamification from "./Gamification";
import AnalyticsChart from "./AnalyticsChart";
import History from "./History";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamificationKey?: number;
  historyKey?: number;
}

export default function ProgressModal({ isOpen, onClose, gamificationKey, historyKey }: ProgressModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="progress-title">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200 max-h-[90vh]">
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <h2 id="progress-title" className="text-2xl font-extrabold font-outfit text-zinc-900 dark:text-zinc-100">
              Progress Anda
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-8">
          <div key={`gamification-${gamificationKey}`} className="glass-panel rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <Gamification />
          </div>
          
          <div key={`analytics-${historyKey}`} className="glass-panel rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <AnalyticsChart />
          </div>

          <div key={`history-${historyKey}`} className="glass-panel rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <History />
          </div>
        </div>
      </div>
    </div>
  );
}
