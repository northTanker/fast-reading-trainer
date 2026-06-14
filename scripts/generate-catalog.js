const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '../public/catalog.json');
const DEEPSEEK_API_KEY = "sk-74c4057ebd764a6d96e8ca166621e72b";

const CATEGORIES = ["Sains", "Teknologi", "Matematika", "Bisnis", "Sejarah", "Fiksi Ilmiah", "Filsafat", "Psikologi"];

async function generateNewArticle() {
  const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  
  const prompt = `Tuliskan satu artikel edukatif dan menarik berbahasa Indonesia tentang topik yang spesifik di bidang ${randomCategory}.
Aturan wajib:
1. Panjang artikel HARUS lebih dari 300 kata.
2. Gaya bahasa formal tapi santai, lugas, langsung ke intinya. Gunakan kalimat-kalimat pendek.
3. DILARANG KERAS menggunakan frasa klise AI seperti "Di era digital yang serba cepat ini", "Penting untuk diingat", "Kesimpulannya", "Tidak dapat dipungkiri".
4. Kembalikan respons murni dalam format JSON (tanpa tag markdown \`\`\`json) dengan struktur:
{
  "title": "Judul Menarik",
  "content": "Isi artikel lengkap di sini..."
}`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-pro",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
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
    // Fallback if AI adds markdown
    const cleanedText = resultText.replace(/```json\n?|\n?```/g, '').trim();
    resultJson = JSON.parse(cleanedText);
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
  
  const countToGenerate = 3; // Generate 3 at a time to avoid rate limits/timeouts
  console.log(`Sedang membangkitkan ${countToGenerate} artikel baru... (Ini mungkin memakan waktu 1-2 menit)`);
  
  for (let i = 0; i < countToGenerate; i++) {
    try {
      const newArticle = await generateNewArticle();
      catalog.push(newArticle);
      console.log(`[${i+1}/${countToGenerate}] + Berhasil: "${newArticle.title}" (${newArticle.wordCount} kata) [${newArticle.category}]`);
      
      // Jeda waktu (delay) 3 detik sebelum pemanggilan API berikutnya agar tidak melanggar batas rate limit
      if (i < countToGenerate - 1) {
        console.log(`⏳ Menunggu 3 detik sebelum melanjutkan...`);
        await delay(3000);
      }
    } catch (err) {
      console.error(`[${i+1}/${countToGenerate}] - Gagal membangkitkan artikel: ${err.message}`);
    }
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nSelesai! Katalog kini memiliki ${catalog.length} artikel.`);
}

run();
