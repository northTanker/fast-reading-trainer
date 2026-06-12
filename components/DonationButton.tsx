"use client";

export default function DonationButton() {
  return (
    <a
      href="https://saweria.co/edwigar"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 p-3 sm:px-4 sm:py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-amber-200/50 dark:border-amber-700/50 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm font-semibold text-zinc-700 dark:text-zinc-300 group hover:border-amber-400 dark:hover:border-amber-500"
    >
      <span className="text-xl group-hover:scale-110 group-hover:rotate-12 transition-transform">☕</span>
      <span className="hidden sm:inline bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent font-bold">Dukung Kami</span>
    </a>
  );
}
