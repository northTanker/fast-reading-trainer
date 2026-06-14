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
  onSelect: (content: string, title?: string) => void;
}

export default function CatalogModal({ isOpen, onClose, onSelect }: CatalogModalProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  useEffect(() => {
    let active = true;
    const fetchCatalog = async () => {
      if (isOpen && items.length === 0) {
        setIsLoading(true);
        try {
          const res = await fetch(`/catalog.json?v=${new Date().getTime()}`);
          const data = await res.json();
          if (active) setItems(data);
        } catch (err) {
          console.error("Gagal memuat katalog:", err);
        } finally {
          if (active) setIsLoading(false);
        }
      }
    };
    fetchCatalog();
    return () => { active = false; };
  }, [isOpen, items.length]);

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

  const categories = ["Semua", ...Array.from(new Set(items.map(item => item.category)))].sort();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-900/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 id="catalog-title" className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-5 rounded-2xl animate-pulse">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
                    <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
                  </div>
                  <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded-md mb-2"></div>
                  <div className="h-5 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-md mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
                    <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
                  </div>
                </div>
              ))}
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
                    onSelect(item.content, item.title);
                    onClose();
                  }}
                  className="group relative bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-5 rounded-3xl cursor-pointer hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 text-6xl pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-12">
                    📚
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-orange-500/10 border border-amber-200/50 dark:border-amber-500/20 px-2.5 py-1 rounded-lg">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      {item.wordCount} kata
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors relative z-10 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed relative z-10 font-medium">
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
