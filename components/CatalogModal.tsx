"use client";

import { useState, useEffect } from "react";

export interface CatalogItem {
  id: string;
  title: string;
  category: string;
  wordCount: number;
  content: string;
}

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export default function CatalogModal({ isOpen, onClose, onSelect }: CatalogModalProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  useEffect(() => {
    if (isOpen && items.length === 0) {
      setIsLoading(true);
      fetch('/catalog.json')
        .then(res => res.json())
        .then(data => {
          setItems(data);
        })
        .catch(err => {
          console.error("Gagal memuat katalog:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  const categories = ["Semua", ...Array.from(new Set(items.map(item => item.category)))].sort();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-900/40 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
              Katalog Teks (500+)
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Pilih dari ratusan artikel berkualitas untuk melatih kecepatan baca Anda.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-6 pb-2 space-y-4">
          <input
            type="text"
            placeholder="Cari topik atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-sm text-zinc-500">Memuat katalog...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-zinc-500">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => {
                    onSelect(item.content);
                    onClose();
                  }}
                  className="group bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-5 rounded-2xl cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      {item.wordCount} kata
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
