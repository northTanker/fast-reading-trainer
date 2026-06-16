"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Medal, Zap, BookOpen } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  bestWpm: number;
  totalWordsRead: number;
  level: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<"xp" | "wpm" | "words">("xp");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        let orderField = "gamification.xp";
        if (activeTab === "wpm") orderField = "gamification.bestWpm";
        if (activeTab === "words") orderField = "gamification.totalWordsRead";

        const q = query(
          collection(db, "users"),
          orderBy(orderField, "desc"),
          limit(20)
        );
        
        const snapshot = await getDocs(q);
        const data: LeaderboardUser[] = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            uid: d.uid || doc.id,
            displayName: d.displayName || "Pengguna Anonim",
            photoURL: d.photoURL || "",
            xp: d.gamification?.xp || 0,
            bestWpm: d.gamification?.bestWpm || 0,
            totalWordsRead: d.gamification?.totalWordsRead || 0,
            level: d.gamification?.level || 1,
          };
        });

        if (isMounted) setUsers(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLeaderboard();

    return () => { isMounted = false; };
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderValue = (user: LeaderboardUser) => {
    if (activeTab === "xp") return <span className="font-bold text-amber-500">{user.xp.toLocaleString()} XP</span>;
    if (activeTab === "wpm") return <span className="font-bold text-blue-500">{user.bestWpm} WPM</span>;
    if (activeTab === "words") return <span className="font-bold text-emerald-500">{user.totalWordsRead.toLocaleString()} Kata</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-extrabold font-outfit text-zinc-900 dark:text-zinc-100">
              Papan Peringkat
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-4 gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("xp")}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "xp" 
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <Medal className="w-4 h-4" /> Top XP
          </button>
          <button 
            onClick={() => setActiveTab("wpm")}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "wpm" 
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <Zap className="w-4 h-4" /> Top WPM
          </button>
          <button 
            onClick={() => setActiveTab("words")}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "words" 
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Top Kata
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50/30 dark:bg-zinc-900/30">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 animate-pulse">
                  <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  </div>
                  <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400">Belum ada data peringkat.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => (
                <div 
                  key={user.uid} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    index === 0 
                      ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50 shadow-sm" 
                      : index === 1
                      ? "bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/50"
                      : index === 2
                      ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/50"
                      : "bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <div className={`w-8 font-extrabold text-center ${
                    index === 0 ? "text-amber-500 text-xl" :
                    index === 1 ? "text-slate-400 text-lg" :
                    index === 2 ? "text-orange-500 text-lg" :
                    "text-zinc-400"
                  }`}>
                    #{index + 1}
                  </div>
                  
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{user.displayName}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Level {user.level}</p>
                  </div>

                  <div className="text-right">
                    {renderValue(user)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
