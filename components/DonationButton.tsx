"use client";

export default function DonationButton() {
  return (
    <a
      href="https://saweria.co/edwigar"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-amber-200/50 dark:border-amber-700/50 rounded-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 group hover:border-amber-400 dark:hover:border-amber-500"
    >
      <span className="text-lg sm:text-xl group-hover:scale-110 group-hover:rotate-12 transition-transform">☕</span>
      <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent font-bold">Dukung Kami</span>
    </a>
  );
}
