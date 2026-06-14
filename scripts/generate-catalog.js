const fs = require('fs');
const path = require('path');

// To use this script, you would run:
// node scripts/generate-catalog.js

const CATALOG_PATH = path.join(__dirname, '../public/catalog.json');

// Mock structure for demonstration. In a real scenario, this would use fetch() 
// to call the OpenAI/DeepSeek API and get new articles.
async function generateNewArticle() {
  // Replace this with actual API call, e.g.:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
  
  const id = 'kat-' + Math.floor(Math.random() * 10000).toString().padStart(3, '0');
  
  return {
    id: id,
    title: "Contoh Judul Artikel Baru (Hasil AI)",
    category: "Sains",
    wordCount: 120,
    content: "Ini adalah teks contoh otomatisasi. Jika Anda sudah mengonfigurasi API Key di script ini, bagian ini akan diisi oleh teks berkualitas tinggi yang dihasilkan oleh AI tentang topik Sains, Teknologi, atau Matematika."
  };
}

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
  
  // Example: generate 5 new articles
  const countToGenerate = 5;
  console.log(`Sedang membangkitkan ${countToGenerate} artikel baru...`);
  
  for (let i = 0; i < countToGenerate; i++) {
    const newArticle = await generateNewArticle();
    catalog.push(newArticle);
    console.log(`+ Berhasil menambahkan: ${newArticle.title}`);
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nSelesai! Katalog kini memiliki ${catalog.length} artikel.`);
  console.log("Buka public/catalog.json untuk melihat hasilnya.");
}

run();
