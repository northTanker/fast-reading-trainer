"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Tally: any;

export default function FeedbackButton() {
  const openTally = () => {
    if (typeof Tally !== 'undefined') {
      Tally.openPopup('wzVvXX', { // Ganti 'wzVvXX' dengan ID Form Tally Anda nanti
        layout: 'modal',
        width: 700,
        emoji: {
          text: '👋',
          animation: 'wave'
        }
      });
    } else {
      // Jika Tally belum dimuat (fallback)
      window.open('https://tally.so', '_blank');
    }
  };

  return (
    <button
      onClick={openTally}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm font-semibold text-zinc-700 dark:text-zinc-300 group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">💡</span>
      <span>Beri Masukan</span>
    </button>
  );
}
