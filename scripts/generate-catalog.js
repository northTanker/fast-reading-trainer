/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '../public/catalog.json');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const CATEGORIES = ["Sains", "Teknologi", "Matematika", "Bisnis", "Sejarah", "Fiksi Ilmiah", "Filsafat", "Psikologi"];

async function generateNewArticle() {
  const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const prompt = `Tuliskan satu artikel berbahasa Indonesia tentang sub-topik yang SANGAT SPESIFIK dan unik (jarang dibahas) di bidang ${randomCategory}. (Jangan bahas topik umum!).
Aturan gaya penulisan (ANTI-AI SLOP):
1. Panjang artikel HARUS lebih dari 300 kata.
2. Gaya bahasa: Kasual, mengalir, bercerita (storytelling), dan asyik dibaca seperti artikel blog Medium atau majalah anak muda. HINDARI bahasa kaku, terlalu formal, atau akademis. Gunakan analogi sehari-hari untuk konsep rumit.
3. Struktur: Variasikan panjang kalimat. Hindari pola paragraf yang repetitif atau menggunakan kata hubung transisi secara kaku di awal kalimat.
4. DILARANG KERAS menggunakan kata/frasa klise AI: "Di era digital yang serba cepat ini", "Penting untuk diingat", "Kesimpulannya", "Tidak dapat dipungkiri", "Secara esensial", "Mengingat hal tersebut", "Pada akhirnya". 
5. Jangan berikan pengantar atau penutup klise. Langsung masuk ke inti cerita sejak kalimat pertama dan akhiri dengan tajam tanpa merangkum ulang.
6. Kembalikan respons murni dalam format JSON (tanpa tag markdown \`\`\`json) dengan struktur:
{
  "title": "Judul Menarik (Gaya Clickbait Edukatif/Santai)",
  "content": "Isi artikel lengkap di sini..."
}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
      'X-Title': 'Fast Reading Trainer'
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const resultText = data.choices[0].message.content;

  let resultJson;
  try {
    resultJson = JSON.parse(resultText);
  } catch (e) {
    // Fallback if AI adds markdown or conversational text
    const match = resultText.match(/\{[\s\S]*\}/);
    if (match) {
      resultJson = JSON.parse(match[0]);
    } else {
      throw new Error("Gagal mengurai JSON dari respons AI.");
    }
  }

  const id = 'kat-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const wordCount = resultJson.content.trim().split(/\s+/).length;

  return {
    id: id,
    title: resultJson.title,
    category: randomCategory,
    wordCount: wordCount,
    content: resultJson.content
  };
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log("Membaca katalog saat ini...");
  let catalog = [];
  try {
    const data = fs.readFileSync(CATALOG_PATH, 'utf8');
    catalog = JSON.parse(data);
  } catch (err) {
    console.log("Katalog tidak ditemukan, membuat baru...");
  }

  console.log(`Katalog saat ini memiliki ${catalog.length} artikel.`);

  // Ambil argumen angka dari command line (misal: node scripts/generate-catalog.js 100)
  // Jika tidak ada argumen yang diberikan, default-nya adalah 100 artikel
  const argCount = parseInt(process.argv[2], 10);
  const countToGenerate = isNaN(argCount) ? 100 : argCount;

  console.log(`Sedang membangkitkan ${countToGenerate} artikel baru... (Ini mungkin memakan waktu lama)`);

  for (let i = 0; i < countToGenerate; i++) {
    try {
      const newArticle = await generateNewArticle();
      catalog.push(newArticle);
      console.log(`[${i + 1}/${countToGenerate}] + Berhasil: "${newArticle.title}" (${newArticle.wordCount} kata) [${newArticle.category}]`);

      // Jeda waktu (delay) 3 detik sebelum pemanggilan API berikutnya agar tidak melanggar batas rate limit
      if (i < countToGenerate - 1) {
        console.log(`⏳ Menunggu 3 detik sebelum melanjutkan...`);
        await delay(3000);
      }
    } catch (err) {
      console.error(`[${i + 1}/${countToGenerate}] - Gagal membangkitkan artikel: ${err.message}`);
    }
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nSelesai! Katalog kini memiliki ${catalog.length} artikel.`);
}

run();
