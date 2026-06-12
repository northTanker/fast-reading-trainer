"use client";

import { useState, useEffect } from "react";

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (text: string) => void;
}

export default function CopilotModal({ isOpen, onClose, onApplyText }: CopilotModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usePrivateKey, setUsePrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("deepseek-private-key");
    if (savedKey) {
      setTimeout(() => setPrivateKey(savedKey), 0);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    setPrivateKey(key);
    localStorage.setItem("deepseek-private-key", key);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Harap masukkan topik terlebih dahulu.");
      return;
    }
    if (usePrivateKey && !privateKey.trim()) {
      setErrorMsg("Harap masukkan API Key Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          apiKey: usePrivateKey ? privateKey : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI");
      }

      onApplyText(data.text);
      onClose();
      setPrompt("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold font-outfit text-zinc-900 dark:text-zinc-100">Buat Teks dengan AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Topik apa yang ingin Anda baca hari ini?
          </label>
          <textarea
            className="w-full h-24 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            placeholder="Contoh: Buatkan cerita sci-fi pendek tentang koloni di Mars..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Settings Toggle */}
        <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              className="w-4 h-4 text-amber-500 rounded border-zinc-300 focus:ring-amber-500"
              checked={usePrivateKey}
              onChange={(e) => setUsePrivateKey(e.target.checked)}
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Gunakan API Key Pribadi (Opsi B)
            </span>
          </label>
          
          {usePrivateKey && (
            <input 
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={privateKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              disabled={isLoading}
              className="w-full p-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
            />
          )}
          {!usePrivateKey && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-7">
              Menggunakan akses publik server (DeepSeek v4 Flash).
            </p>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Menulis Artikel...</span>
            </>
          ) : (
            <>
              <span>Mulai Tulis</span>
              <span>✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
