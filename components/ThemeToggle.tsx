"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    localStorage.setItem("theme", theme);
    root.classList.add(theme);
  }, [theme, mounted]);

  if (!mounted) {
    return <div className="h-9 w-9 sm:h-10 sm:w-auto px-0 sm:px-4" />; // Placeholder with same height
  }

  const cycleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={cycleTheme}
      className="h-9 w-9 sm:h-10 sm:w-auto px-0 sm:px-4 flex items-center justify-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm border border-zinc-200 dark:border-zinc-700 font-medium text-sm"
      aria-label="Toggle theme"
      title={`Tema saat ini: ${theme === "light" ? "Terang" : "Gelap"}`}
    >
      {theme === "light" && <><span className="text-base">☀️</span> <span className="hidden sm:inline">Terang</span></>}
      {theme === "dark" && <><span className="text-base">🌙</span> <span className="hidden sm:inline">Gelap</span></>}
    </button>
  );
}
