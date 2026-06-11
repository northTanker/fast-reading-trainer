# Pelatih Membaca Cepat (Speed Reading Trainer)

Aplikasi web inovatif yang dirancang untuk membantu Anda meningkatkan kecepatan membaca secara drastis menggunakan teknik **ORP (Optimal Recognition Point)**.

## 💡 Mengapa Aplikasi Ini Dibuat?

Seringkali kita kesulitan mempertahankan fokus atau terjebak dalam kebiasaan membaca sambil "menggumam" dalam hati (subvokalisasi). Hal ini tidak hanya memakan energi, tetapi juga memperlambat kecepatan membaca kita secara drastis. 

Aplikasi ini dikembangkan untuk memecahkan masalah tersebut dengan menggabungkan teknologi **RSVP (Rapid Serial Visual Presentation)** dan **ORP (Optimal Recognition Point)**. Dengan menyorot titik fokus spesifik pada setiap kata dan menampilkannya satu per satu secara sentral, mata Anda tidak perlu lagi bergerak merayap dari kiri ke kanan.

Hasilnya, Anda dapat menyerap informasi lebih cepat, mengurangi kelelahan mata, dan memutus rantai kebiasaan subvokalisasi secara efektif. Peningkatan kemampuan membaca ini sangat berharga untuk pelajar, profesional, maupun siapa saja yang ingin mengkonsumsi literatur dengan efisien.

## 🚀 Manfaat Web App Ini

1. **Meningkatkan Kecepatan Membaca (WPM)**
   Dengan memusatkan fokus pada satu titik per kata (ORP), mata Anda tidak perlu repot-repot bergerak dari kiri ke kanan. Hal ini secara signifikan memangkas waktu transisi dan membuat kecepatan membaca (*Words Per Minute* / WPM) bisa melesat tinggi (hingga 300-500 WPM atau lebih).
   
2. **Mengurangi Subvokalisasi**
   Menampilkan kata per kata secara berurutan (*RSVP / Rapid Serial Visual Presentation*) mencegah Anda menggumamkan kata-kata dalam pikiran, kebiasaan yang sering menghambat kecepatan membaca.

3. **Gamifikasi untuk Motivasi**
   Dilengkapi dengan pencapaian (*achievements*), pelacakan rekor beruntun (*day streak*), dan akumulasi total kata yang dibaca untuk menjaga motivasi berlatih setiap hari.

4. **Kenyamanan Privasi (Client-Side)**
   Semua teks dan riwayat sesi membaca hanya disimpan secara lokal di peramban Anda (*localStorage*). Anda bebas menempelkan teks atau buku apapun tanpa perlu khawatir data Anda terekam di server.

5. **Aksesibilitas dan Dukungan Luring (Offline)**
   - Mendukung aksesibilitas (*A11y*) penuh untuk perangkat pembaca layar (*screen-reader*).
   - Mendukung fitur **PWA (Progressive Web App)** sehingga Anda bisa menginstal aplikasi ini ke layar beranda perangkat (ponsel/laptop) dan menggunakannya tanpa koneksi internet.

6. **Pustaka Pribadi (My Library)**
   Simpan materi bacaan panjang, esai, atau draf dokumen yang ingin Anda baca di sesi-sesi selanjutnya, lalu atur pustaka tersebut dengan rapi.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun di atas infrastruktur modern dengan prinsip **Harness-Native Operator System (ECC Workflow)**, menjamin ketangguhan, keamanan tipe data, dan pengalaman pengembangan yang maksimal:

- **Framework**: Next.js 16.2 (App Router) + React 19.2
- **Bahasa**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 (menggunakan format impor CSS dan `@theme`)
- **Validasi Data**: Zod (memastikan integritas data dari dan ke `localStorage` agar tidak menyebabkan *crash*).
- **Pengujian (TDD)**: Vitest (menguji algoritma tokenizer dan logika pemisah ORP).
- **State Management**: `useSyncExternalStore` Hook dari React 18+ (menjamin antarmuka reaktif pada saat sinkronisasi data dengan *localStorage* antar-tab, tanpa terjebak *infinite loop* re-render).
- **Bundler**: Turbopack

## 💻 Cara Menjalankan Secara Lokal

1. **Pasang Dependensi**
   ```bash
   npm install
   ```
2. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.
4. **Jalankan Validasi Linter & Tipe**
   ```bash
   npm run lint && npx tsc --noEmit
   ```
5. **Jalankan Pengujian (Testing)**
   ```bash
   npx vitest run
   ```
