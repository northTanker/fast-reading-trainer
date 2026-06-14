"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthButtonProps {
  onCheckProgress: () => void;
  onOpenLibrary?: () => void;
}

export default function AuthButton({ onCheckProgress, onOpenLibrary }: AuthButtonProps) {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse">
        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't show anything if logged out
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all ${
          isOpen ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
        title="Menu Profil"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} 
          alt={user.displayName || "User"} 
          className="w-7 h-7 rounded-full object-cover"
        />
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
          {user.displayName?.split(" ")[0] || "User"}
        </span>
        <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Masuk sebagai</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onCheckProgress();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <span>📊</span> Cek Progress
            </button>
            {onOpenLibrary && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLibrary();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors mt-1"
              >
                <span>📚</span> Perpustakaan
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors mt-1"
            >
              <span>🚪</span> Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
