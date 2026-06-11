"use client";

import { useState } from "react";
import { SAMPLE_TEXTS } from "@/lib/samples";
import { useLibrary } from "@/hooks/useLibrary";
import { saveTextToLibrary, removeTextFromLibrary } from "@/lib/library";

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
  onStart: () => void;
  wordCount: number;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  disabled: boolean;
}

export default function TextInput({
  text,
  onChange,
  onStart,
  wordCount,
  wpm,
  onWpmChange,
  disabled,
}: TextInputProps) {
  const library = useLibrary();
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSampleClick = (content: string) => {
    onChange(content);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    saveTextToLibrary(saveTitle.trim() || "Untitled Text", text);
    setSaveTitle("");
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">
          Tempelkan teks Anda di sini
        </label>
        <textarea
          className="w-full h-48 p-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/50 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all duration-300 shadow-inner"
          placeholder="Tempelkan artikel, esai, atau kutipan buku..."
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        
        <div className="flex justify-between items-center px-1 flex-wrap gap-2">
          <span className="text-xs text-zinc-500 font-medium">
            {wordCount} kata
          </span>
          <div className="flex items-center gap-3">
            {text.trim().length > 0 && !isSaving && (
              <button
                type="button"
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
                onClick={() => setIsSaving(true)}
              >
                Simpan ke Pustaka
              </button>
            )}
            <button
              type="button"
              className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 disabled:opacity-50 transition-colors font-medium"
              onClick={() => onChange("")}
              disabled={disabled || !text}
            >
              Hapus teks
            </button>
          </div>
        </div>

        {isSaving && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <input 
              type="text" 
              placeholder="Judul untuk teks ini..." 
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="flex-1 text-sm bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-amber-500 focus:outline-none px-1 py-1 text-zinc-900 dark:text-zinc-100"
              autoFocus
            />
            <button 
              onClick={handleSave}
              className="text-xs px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Simpan
            </button>
            <button 
              onClick={() => setIsSaving(false)}
              className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
            Atau coba contoh teks
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="text-xs px-4 py-2 rounded-full border border-zinc-200/80 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-50"
                onClick={() => handleSampleClick(sample.content)}
                disabled={disabled}
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {library.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Pustakaku
            </label>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
              {library.map((item) => (
                <div key={item.id} className="flex items-center justify-between group rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50">
                  <button 
                    type="button"
                    className="text-xs font-medium text-left truncate flex-1 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    onClick={() => handleSampleClick(item.content)}
                  >
                    {item.title}
                  </button>
                  <button 
                    className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 px-2 py-1"
                    onClick={() => removeTextFromLibrary(item.id)}
                    aria-label="Delete saved text"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 pt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">
          <span>Kecepatan Awal</span>
          <span className="text-amber-500 font-bold">{wpm} WPM</span>
        </div>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          value={wpm}
          onChange={(e) => onWpmChange(parseInt(e.target.value))}
          className="w-full accent-amber-500 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer hover:accent-amber-400 transition-all"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-1">
          <span>100</span>
          <span>550</span>
          <span>1000</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white hover:from-zinc-800 hover:to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-white dark:hover:to-zinc-200 font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-lg shadow-zinc-900/20 dark:shadow-white/10"
        onClick={onStart}
        disabled={disabled || !text.trim()}
      >
        Mulai Membaca
      </button>
    </div>
  );
}
