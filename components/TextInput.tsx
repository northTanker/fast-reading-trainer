"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import { saveTextToLibrary, removeTextFromLibrary } from "@/lib/library";
import { parseFile } from "@/lib/fileParser";

const CopilotModal = dynamic(() => import("./CopilotModal"), { ssr: false });
const CatalogModal = dynamic(() => import("./CatalogModal"), { ssr: false });

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
  onStart: () => void;
  wordCount: number;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  disabled: boolean;
  onSourceChange?: (source: "manual" | "catalog" | "ai", title?: string) => void;
}

export default function TextInput({
  text,
  onChange,
  onStart,
  wordCount,
  wpm,
  onWpmChange,
  disabled,
  onSourceChange,
}: TextInputProps) {
  const library = useLibrary();
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleSampleClick = (content: string, title?: string) => {
    onChange(content);
    if (onSourceChange) {
      onSourceChange("catalog", title);
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    saveTextToLibrary(saveTitle.trim() || "Untitled Text", text);
    setSaveTitle("");
    setIsSaving(false);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsParsing(true);
      const extractedText = await parseFile(file);
      onChange(extractedText);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengurai berkas.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFormatText = async () => {
    if (!text.trim() || isFormatting) return;
    
    try {
      setIsFormatting(true);
      
      const apiKey = localStorage.getItem("deepseek_api_key") || "";
      
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: text, 
          apiKey,
          mode: "format"
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal merapikan teks");
      }

      const data = await res.json();
      if (data.text) {
        onChange(data.text);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Gagal merapikan teks");
    } finally {
      setIsFormatting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || isParsing) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isParsing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 relative">
        <div className="flex justify-between items-center ml-1 flex-wrap gap-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Masukkan teks, atau seret dokumen ke sini
          </label>
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
            {wordCount} kata
          </span>
        </div>
        
        <div 
          className="relative group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <textarea
            className={`w-full h-48 p-5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border ${isDragging ? 'border-amber-500 ring-2 ring-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10' : 'border-zinc-200/80 dark:border-zinc-700/50'} rounded-t-2xl border-b-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-0 resize-none transition-all duration-300 shadow-inner`}
            placeholder="Ketik atau tempel teks di sini..."
            value={text}
            onChange={(e) => {
              onChange(e.target.value);
              if (onSourceChange) onSourceChange("manual");
            }}
            disabled={disabled || isParsing}
          />
          {/* Action Toolbar */}
          <div className={`flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/80 backdrop-blur-md border ${isDragging ? 'border-amber-500 border-t-0' : 'border-zinc-200/80 dark:border-zinc-700/50 border-t-0'} rounded-b-2xl transition-all`}>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer transition-colors shadow-sm active:scale-95 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Unggah Dokumen
                <input 
                  type="file" 
                  accept=".txt,.md,.csv,.docx,.pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = '';
                  }}
                  disabled={disabled || isParsing}
                />
              </label>
              <button
                type="button"
                onClick={() => setIsCopilotOpen(true)}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/30 px-3 py-1.5 rounded-lg hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>✨</span> AI Buatkan Teks
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {text.trim().length > 0 && !isSaving && (
                <>
                  <button
                    type="button"
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors active:scale-95 flex items-center gap-1.5"
                    onClick={handleFormatText}
                    disabled={isFormatting || isParsing}
                  >
                    <span>🪄</span> Rapikan
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2 py-1.5 transition-colors"
                    onClick={() => setIsSaving(true)}
                    disabled={isFormatting}
                  >
                    💾 Simpan
                  </button>
                </>
              )}
              {text.trim().length > 0 && (
                <button
                  type="button"
                  className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2 py-1.5 transition-colors"
                  onClick={() => onChange("")}
                  disabled={disabled}
                >
                  🗑️ Hapus
                </button>
              )}
            </div>
          </div>

          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-amber-500 z-10 pointer-events-none">
              <span className="text-amber-600 dark:text-amber-500 font-bold text-lg animate-pulse">
                Lepaskan dokumen di sini...
              </span>
            </div>
          )}
          {isParsing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl z-10 pointer-events-none gap-3">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-zinc-600 dark:text-zinc-400 font-medium text-sm animate-pulse">
                Mengekstrak teks...
              </span>
            </div>
          )}
          {isFormatting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl z-10 pointer-events-none gap-3">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-zinc-600 dark:text-zinc-400 font-medium text-sm animate-pulse">
                AI sedang merapikan teks Anda...
              </span>
            </div>
          )}
        </div>

        {isSaving && (
          <div className="flex items-center gap-2 mt-1 px-1 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 animate-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder="Judul untuk teks ini..." 
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="flex-1 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 text-zinc-900 dark:text-zinc-100 outline-none"
              autoFocus
            />
            <button 
              onClick={handleSave}
              className="text-xs px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-lg font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm active:scale-95"
            >
              Simpan
            </button>
            <button 
              onClick={() => setIsSaving(false)}
              className="text-xs px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors active:scale-95"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
            Atau gunakan teks contoh
          </label>
          <button
            type="button"
            onClick={() => setIsCatalogOpen(true)}
            disabled={disabled}
            className="flex items-center justify-center gap-3 w-full py-4 px-4 rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-50/30 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 font-semibold hover:bg-amber-100/50 dark:hover:bg-amber-500/20 hover:border-amber-500 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base group active:scale-95"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
            Jelajahi Katalog Teks (500+)
          </button>
        </div>

        {library.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
              Pustaka Tersimpan
            </label>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
              {library.map((item) => (
                <div key={item.id} className="flex items-center justify-between group rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50">
                  <button 
                    type="button"
                    className="text-xs font-medium text-left truncate flex-1 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors active:scale-95"
                    onClick={() => handleSampleClick(item.content)}
                  >
                    {item.title}
                  </button>
                  <button 
                    className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 px-2 py-1 active:scale-95"
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
          <span>Kecepatan (WPM)</span>
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
        className={`relative w-full py-4 mt-2 rounded-2xl font-bold text-lg transition-all duration-500 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] overflow-hidden group ${
          text.trim() && !disabled
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] border-b-4 border-orange-600/50'
            : 'bg-gradient-to-r from-zinc-800 to-zinc-700 dark:from-zinc-200 dark:to-zinc-300 text-zinc-300 dark:text-zinc-600 shadow-lg border-b-4 border-zinc-900 dark:border-zinc-400 opacity-60'
        }`}
        onClick={onStart}
        disabled={disabled || !text.trim()}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
          Mulai Baca {text.trim() && !disabled && <span className="text-2xl group-hover:translate-x-1 transition-transform">🚀</span>}
        </span>
      </button>

      <CopilotModal 
        isOpen={isCopilotOpen} 
        onClose={() => setIsCopilotOpen(false)} 
        onApplyText={(newText, title) => {
          onChange(newText);
          if (onSourceChange) onSourceChange("ai", title);
        }}
      />

      <CatalogModal 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelect={(content, title) => handleSampleClick(content, title)}
      />
    </div>
  );
}
