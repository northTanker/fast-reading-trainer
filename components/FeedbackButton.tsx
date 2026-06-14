"use client";

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
      className="flex items-center gap-2 p-3 sm:px-4 sm:py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-sm font-semibold text-zinc-700 dark:text-zinc-300 group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">💡</span>
      <span className="hidden sm:inline">Saran dan Kritik</span>
    </button>
  );
}
