import { useEffect, useState } from "react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <h2 className="text-2xl font-extrabold font-outfit text-zinc-900 dark:text-zinc-100">
              Pusat Edukasi
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ✕
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
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <p className="text-sm">
                  <strong>Privasi Terjamin 🔒:</strong> Semua teks yang Anda unggah atau rekatkan di sini 100% diproses secara lokal di peramban (browser) Anda. Tidak ada data yang dikirim ke server.
                </p>
              </div>
            </div>
          )}

          {activeTab === "how" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <p>
                Untuk memaksimalkan penggunaan aplikasi ini, ikuti langkah-langkah berikut:
              </p>
              <ol className="list-decimal pl-5 space-y-3 font-medium">
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Pilih Teks yang Sesuai:</span>
                  <p className="font-normal text-sm mt-1">Mulai dengan artikel ringan atau berita. Hindari menguji coba dengan teks akademis atau jurnal yang terlalu berat pada tahap awal.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Atur WPM (Words Per Minute):</span>
                  <p className="font-normal text-sm mt-1">Gunakan kecepatan default (250 WPM) sebagai awalan. Tingkatkan kecepatan secara bertahap (+50 WPM) ketika Anda merasa sudah mulai terbiasa dan tidak lagi &quot;menggumam&quot; (subvokalisasi).</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Fokus pada Titik Emas:</span>
                  <p className="font-normal text-sm mt-1">Jangan mencoba memindai seluruh kata. Tatap mata Anda tepat pada satu huruf yang diwarnai emas. Percayalah bahwa periferal mata dan otak Anda dapat mengenali kata tersebut secara utuh.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Gunakan Shortcut Keyboard:</span>
                  <p className="font-normal text-sm mt-1">Tekan <kbd className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">Spasi</kbd> untuk Jeda/Lanjut, Panah Kanan/Kiri untuk WPM, dan Panah Atas/Bawah untuk Ukuran Teks.</p>
                </li>
                <li>
                  <span className="text-amber-600 dark:text-amber-400">Evaluasi Pemahaman:</span>
                  <p className="font-normal text-sm mt-1">Setelah selesai membaca, gunakan fitur <strong>Tes Pemahaman AI</strong> untuk memastikan kecepatan Anda berbanding lurus dengan kemampuan menyerap informasi.</p>
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
                  <span className="text-2xl mb-2 block">⏳</span>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Efisiensi Waktu</h4>
                  <p className="text-sm">Menyelesaikan tumpukan artikel, email, atau dokumen kerja dua kali lipat lebih cepat. Waktu sisanya bisa digunakan untuk istirahat.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-2xl mb-2 block">🧠</span>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Stimulasi Otak</h4>
                  <p className="text-sm">Memaksa otak bekerja pada kecepatan optimalnya, yang justru meningkatkan daya konsentrasi dan meminimalisir distraksi pikiran.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-2xl mb-2 block">🔋</span>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">Hemat Energi Mata</h4>
                  <p className="text-sm">Regresi (mata kembali ke belakang) adalah penyebab utama mata cepat lelah saat membaca konvensional. RSVP mengeliminasi ini.</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-2xl mb-2 block">📈</span>
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
