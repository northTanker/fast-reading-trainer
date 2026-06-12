"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
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

    if (theme === "system") {
      localStorage.removeItem("theme");
      // System mode relies on the media query in globals.css,
      // but to ensure the right variables are used if they are scoped to classes:
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    } else {
      localStorage.setItem("theme", theme);
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div className="h-10 px-4" />; // Placeholder with same height
  }

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  return (
    <button
      onClick={cycleTheme}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 h-10 w-10 sm:w-auto px-0 sm:px-4 flex items-center justify-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm border border-zinc-200 dark:border-zinc-700 font-medium text-sm"
      aria-label="Toggle theme"
      title={`Tema saat ini: ${theme === "system" ? "Sistem" : theme === "light" ? "Terang" : "Gelap"}`}
    >
      {theme === "light" && <><span className="text-base">☀️</span> <span className="hidden sm:inline">Terang</span></>}
      {theme === "dark" && <><span className="text-base">🌙</span> <span className="hidden sm:inline">Gelap</span></>}
      {theme === "system" && <><span className="text-base">💻</span> <span className="hidden sm:inline">Sistem</span></>}
    </button>
  );
}
