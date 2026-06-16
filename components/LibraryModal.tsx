"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserLibrary } from "@/lib/db";
import type { SavedText } from "@/types";
import { X, BookOpen, Sparkles } from "lucide-react";

export default function LibraryModal({ 
  isOpen, 
  onClose,
  onSelectText
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSelectText: (text: string, title?: string, source?: "ai" | "catalog" | "manual") => void;
}) {
  const { user } = useAuth();
  const [library, setLibrary] = useState<SavedText[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      getUserLibrary(user.uid).then((data) => {
        setLibrary(data);
        setLoading(false);
      });
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="library-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <h2 id="library-title" className="text-xl font-bold font-outfit text-zinc-900 dark:text-zinc-100">Perpustakaan Saya</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {!user ? (
            <div className="text-center py-12 text-zinc-500">
              <p>Silakan login untuk melihat perpustakaan Anda.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-zinc-500 animate-pulse">
              <p>Memuat perpustakaan...</p>
            </div>
          ) : library.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>Perpustakaan Anda masih kosong.</p>
              <p className="text-sm mt-2 flex items-center justify-center">Gunakan fitur <b><Sparkles className="w-4 h-4 inline-block text-amber-500 mr-1 ml-1" /> Buat Teks dengan AI</b> dan simpan teksnya ke sini.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {library.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-amber-500/50 transition-colors group text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                    <span className="text-xs text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                    {item.content}
                  </p>
                  <button
                    onClick={() => {
                      onSelectText(item.content, item.title, "ai");
                      onClose();
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors"
                  >
                    Baca Sekarang
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
