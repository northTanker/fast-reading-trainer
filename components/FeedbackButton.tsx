"use client";
import { Lightbulb } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Tally: any;

export default function FeedbackButton() {
  const openTally = () => {
    if (typeof Tally !== 'undefined') {
      Tally.openPopup('7RPxoa', { // Menggunakan ID Form asli milik Anda
        layout: 'modal',
        width: 700,
        emoji: {
          text: '👋',
          animation: 'wave'
        }
      });
    } else {
      // Jika Tally belum dimuat (fallback)
      window.open('https://tally.so/r/7RPxoa', '_blank');
    }
  };

  return (
    <button
      onClick={openTally}
      className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 group"
    >
      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform text-amber-500" />
      <span>Saran dan Kritik</span>
    </button>
  );
}
