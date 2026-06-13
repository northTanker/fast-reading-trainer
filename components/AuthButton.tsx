"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    );
  }

  if (user) {
    return (
      <button
        onClick={signOut}
        className="group relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-red-500 transition-colors"
        title="Sign Out"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} 
          alt={user.displayName || "User"} 
          className="w-full h-full object-cover group-hover:opacity-10 transition-opacity"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-bold text-red-500 transition-opacity">
          Keluar
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        <path fill="none" d="M1 1h22v22H1z" />
      </svg>
      Login
    </button>
  );
}
