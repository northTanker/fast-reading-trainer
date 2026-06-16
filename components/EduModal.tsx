import { useEffect, useState } from "react";
import { BookOpen, Lock, Timer, Brain, Battery, TrendingUp, X } from "lucide-react";

interface EduModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EduModal({ isOpen, onClose }: EduModalProps) {
  const [activeTab, setActiveTab] = useState<"why" | "how" | "benefits">("why");

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="edu-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-500" />
            <h2 id="edu-title" className="text-2xl font-extrabold font-outfit text-zinc-900 dark:text-zinc-100">
              Pusat Edukasi
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
          <button 
            onClick={() => setActiveTab("why")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "why" 
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Mengapa Dibuat?
          </button>
          <button 
            onClick={() => setActiveTab("how")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "how" 
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Cara Memaksimalkan
          </button>
          <button 
            onClick={() => setActiveTab("benefits")}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === "benefits" 
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Manfaat Speed Reading
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto pr-2 custom-scrollbar text-zinc-700 dark:text-zinc-300 space-y-4 flex-1">
          {activeTab === "why" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <p>
                Seringkali kita kesulitan fokus atau terjebak dalam kebiasaan membaca sambil <strong>&quot;menggumam&quot; dalam hati (subvokalisasi)</strong>. Selain itu, mata kita secara tidak sadar sering melompat mundur untuk mengulang kata (regresi). Hal ini memperlambat kecepatan membaca kita secara drastis.
              </p>
              <p>
                Aplikasi ini dikembangkan secara khusus untuk memecahkan masalah tersebut dengan menggabungkan dua teknologi utama:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>RSVP (Rapid Serial Visual Presentation):</strong> Menampilkan kata satu per satu di tempat yang sama, sehingga mata Anda tidak perlu lelah bergerak dari kiri ke kanan halaman.
                </li>
                <li>
                  <strong>ORP (Optimal Recognition Point):</strong> Menyorot huruf spesifik pada setiap kata (biasanya agak ke kiri dari tengah) dengan warna berbeda (kuning/emas). Dengan menatap huruf ini, otak Anda dapat mengenali seluruh bentuk kata secara instan tanpa harus mengejanya.
                </li>
              </ul>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl flex gap-3 items-start">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>Privasi Terjamin:</strong> Semua teks yang Anda unggah atau rekatkan di sini 100% diproses secara lokal di peramban (browser) Anda. Tidak ada data yang dikirim ke server.
                </p>
              </div>
            </div>
          )}

          {activeTab === "how" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <p>
                Panduan lengkap menggunakan BacaKilat untuk melatih kecepatan membaca Anda:
              </p>
              <ol className="list-decimal pl-5 space-y-3 font-medium">
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Pilih Teks & Sumber:</span>
                  <p className="font-normal text-sm mt-1">Gunakan fitur <b>✨ AI Buatkan Teks</b> untuk membuat artikel baru, jelajahi <b>Katalog Teks</b> (artikel yang sudah pernah dibaca akan ditandai secara visual agar Anda tahu progres Anda), atau cukup tempelkan teks sendiri.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Atur Kecepatan (WPM):</span>
                  <p className="font-normal text-sm mt-1">Gunakan kecepatan default (250 WPM) sebagai awalan. Tingkatkan kecepatan perlahan jika Anda sudah merasa nyaman. Jangan terlalu memaksakan diri di awal.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Fokus pada Titik Merah/Emas:</span>
                  <p className="font-normal text-sm mt-1">Saat membaca, fokuskan mata Anda HANYA pada huruf yang diwarnai terang. Jangan gerakkan mata Anda ke kiri dan kanan. Biarkan kata-kata berganti dengan sendirinya.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Gunakan Shortcut Keyboard (Desktop):</span>
                  <p className="font-normal text-sm mt-1">Tekan <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">Spasi</kbd> untuk Jeda/Lanjut, <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">Panah Kanan/Kiri</kbd> untuk melompati kata, dan <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">Esc</kbd> untuk mengakhiri sesi lebih awal.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Uji Pemahaman & Pilih Tingkat Kesulitan:</span>
                  <p className="font-normal text-sm mt-1">Setiap selesai membaca, manfaatkan fitur <b>Kuis Pemahaman (AI)</b>. Anda kini bisa memilih tingkat kesulitan kuis (Mudah, Sedang, Sulit) untuk menguji seberapa dalam Anda memahami inti maupun detail teks tersebut.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Simpan Progres di Profil:</span>
                  <p className="font-normal text-sm mt-1">Pastikan Anda <b>Login</b>! Semua riwayat bacaan, skor kuis, teks tersimpan di perpustakaan, serta koleksi lencana Anda akan aman tersimpan dan bisa diakses dari perangkat manapun.</p>
                </li>
              </ol>
            </div>
          )}

          {activeTab === "benefits" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <p>
                Membaca cepat bukan sekadar tentang balapan menghabiskan buku. Ini adalah keterampilan kognitif (cognitive skill) tingkat tinggi dengan segudang manfaat:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Timer className="w-8 h-8 text-blue-500 mb-3" />
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Efisiensi Waktu</h4>
                  <p className="text-sm">Menyelesaikan tumpukan artikel, email, atau dokumen kerja dua kali lipat lebih cepat. Waktu sisanya bisa digunakan untuk istirahat.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Brain className="w-8 h-8 text-purple-500 mb-3" />
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Stimulasi Otak</h4>
                  <p className="text-sm">Memaksa otak bekerja pada kecepatan optimalnya, yang justru meningkatkan daya konsentrasi dan meminimalisir distraksi pikiran.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Battery className="w-8 h-8 text-emerald-500 mb-3" />
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Hemat Energi Mata</h4>
                  <p className="text-sm">Regresi (mata kembali ke belakang) adalah penyebab utama mata cepat lelah saat membaca konvensional. RSVP mengeliminasi ini.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <TrendingUp className="w-8 h-8 text-amber-500 mb-3" />
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Peningkatan Karir</h4>
                  <p className="text-sm">Orang yang mampu mencerna data tertulis dengan cepat memiliki keunggulan kompetitif yang sangat besar di dunia profesional modern.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
