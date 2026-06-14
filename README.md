# BacaKilat - Pelatih Membaca Cepat (Speed Reading Trainer)

Aplikasi web inovatif yang dirancang untuk membantu Anda meningkatkan kecepatan membaca secara drastis menggunakan teknik **ORP (Optimal Recognition Point)**.

## 💡 Mengapa Aplikasi Ini Dibuat?

Seringkali kita kesulitan mempertahankan fokus atau terjebak dalam kebiasaan membaca sambil "menggumam" dalam hati (subvokalisasi). Hal ini tidak hanya memakan energi, tetapi juga memperlambat kecepatan membaca kita secara drastis. 

Aplikasi ini dikembangkan untuk memecahkan masalah tersebut dengan menggabungkan teknologi **RSVP (Rapid Serial Visual Presentation)** dan **ORP (Optimal Recognition Point)**. Dengan menyorot titik fokus spesifik pada setiap kata dan menampilkannya satu per satu secara sentral, mata Anda tidak perlu lagi bergerak merayap dari kiri ke kanan.

Hasilnya, Anda dapat menyerap informasi lebih cepat, mengurangi kelelahan mata, dan memutus rantai kebiasaan subvokalisasi secara efektif. Peningkatan kemampuan membaca ini sangat berharga untuk pelajar, profesional, maupun siapa saja yang ingin mengkonsumsi literatur dengan efisien.

## 🚀 Fitur Utama & Manfaat

1. **Meningkatkan Kecepatan Membaca (WPM)**
   Dengan memusatkan fokus pada satu titik per kata (ORP), mata Anda tidak perlu repot-repot bergerak dari kiri ke kanan. Hal ini secara signifikan memangkas waktu transisi dan membuat kecepatan membaca (*Words Per Minute* / WPM) bisa melesat tinggi (hingga 300-500+ WPM).
   
2. **Mengurangi Subvokalisasi**
   Menampilkan kata per kata secara berurutan (*RSVP*) mencegah Anda menggumamkan kata-kata dalam pikiran, kebiasaan yang sering menghambat kecepatan membaca.

3. **Gamifikasi & Pelacakan Progres**
   Dilengkapi dengan pencapaian (*achievements/badges*), pelacakan rekor beruntun (*day streak*), dan akumulasi total kata yang dibaca untuk menjaga motivasi berlatih setiap hari.

4. **✨ AI-Powered: Asisten Copilot & Generator Kuis**
   Terintegrasi dengan **DeepSeek AI**! Anda bisa meminta AI untuk membuatkan ringkasan artikel, teks latihan khusus, atau bahkan membuat kuis pemahaman bacaan (reading comprehension quiz) langsung dari teks yang baru saja Anda baca.

5. **Cloud Sync & Pustaka Pribadi (My Library)**
   Dengan integrasi **Firebase Authentication & Firestore**, progres membaca, lencana (badges), dan teks tersimpan Anda akan tersinkronisasi dengan aman di cloud. Anda bisa melanjutkannya dari perangkat mana saja. Semua materi bacaan, esai, atau dokumen panjang dapat Anda simpan di Pustaka Pribadi.

6. **Aksesibilitas dan Dukungan Mobile-First**
   - Responsif dan elegan baik di Desktop maupun Mobile.
   - Mendukung aksesibilitas (*A11y*) penuh untuk perangkat pembaca layar dan navigasi keyboard.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun di atas infrastruktur modern dengan prinsip **Harness-Native Operator System (ECC Workflow)**, menjamin ketangguhan, keamanan tipe data, dan pengalaman pengembangan yang maksimal:

- **Framework**: Next.js 16.2 (App Router) + React 19.2
- **Bahasa**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 (menggunakan format impor CSS dan `@theme`)
- **Backend & Auth**: Firebase Admin SDK & Firebase Client (Authentication, Firestore, Storage)
- **AI Integration**: REST API DeepSeek
- **Validasi Data**: Zod
- **Pengujian (TDD)**: Vitest
- **Bundler**: Turbopack

## 💻 Cara Menjalankan Secara Lokal

1. **Pasang Dependensi**
   ```bash
   npm install
   ```

2. **Pengaturan Environment Variables**
   Buat file `.env.local` di *root directory* dan tambahkan kunci berikut:
   ```env
   # API Keys
   DEEPSEEK_API_KEY=your_deepseek_api_key

   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxx

   # Firebase Admin Config (untuk verifikasi token di backend)
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```

3. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.
5. **Jalankan Validasi Linter & Tipe**
   ```bash
   npm run lint && npx tsc --noEmit
   ```

---

Dibuat dengan ❤️ oleh Edwigar Annas Akbar.
