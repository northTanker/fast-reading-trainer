import { NextResponse } from "next/server";

import { z } from "zod";

const quizSchema = z.object({
  text: z.string().min(1, "Teks tidak boleh kosong").max(50000),
  apiKey: z.string().optional(),
  difficulty: z.enum(["mudah", "sedang", "sulit"]).optional(),
});

 // Izinkan hingga 60 detik untuk memproses AI

export async function POST(req: Request) {
  try {
    const { text, apiKey, difficulty = "sedang" } = quizSchema.parse(await req.json());

    let token = apiKey;

    // Jika tidak menggunakan custom API Key, pastikan user login (verifikasi Firebase Auth)
    if (!apiKey) {
      const authHeader = req.headers.get("Authorization");
      const idToken = authHeader?.split("Bearer ")[1];
      if (!idToken) {
        return NextResponse.json({ error: "Missing authentication" }, { status: 401 });
      }
      try {
        const apiKeyFb = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKeyFb}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.error) {
          throw new Error("Invalid token");
        }
      } catch (err) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      
      token = process.env.DEEPSEEK_API_KEY;
      if (!token) {
        return NextResponse.json(
          { error: "Kunci API peladen tidak dikonfigurasi." },
          { status: 500 }
        );
      }
    } else {
      // Validasi API Key custom secara sederhana
      if (!token || token.length < 10) {
        return NextResponse.json(
          { error: "Kunci API tidak ditemukan. Silakan gunakan kunci pribadi Anda." },
          { status: 401 }
        );
      }
    }

    let questionCount = 7;
    let difficultyPrompt = "Fokus pada pertanyaan yang menyeimbangkan fakta eksplisit dan pemahaman tersirat (inferensi), ide pokok, serta tujuan penulis.";

    if (difficulty === "mudah") {
      questionCount = 5;
      difficultyPrompt = "Fokus pada pemahaman dasar, mencari fakta eksplisit, identifikasi tokoh, dan alur cerita yang jelas di dalam teks.";
    } else if (difficulty === "sulit") {
      questionCount = 10;
      difficultyPrompt = "Fokus pada pertanyaan berpikir kritis, sintesis informasi, nada atau gaya bahasa, kesimpulan abstrak, dan penalaran logis tingkat lanjut.";
    }

    const systemPrompt = `Anda adalah asisten pembuat kuis pemahaman membaca. Buatlah tepat ${questionCount} pertanyaan pilihan ganda berdasarkan teks yang diberikan.
Tingkat kesulitan kuis ini adalah **${difficulty.toUpperCase()}**.
Instruksi khusus kesulitan: ${difficultyPrompt}

Kembalikan dalam format JSON murni dengan struktur persis seperti berikut:
{
  "questions": [
    {
      "question": "Apa topik utama...",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswerIndex": 0
    }
  ]
}
Pastikan hanya mengembalikan JSON yang valid tanpa markdown block (\`\`\`json).`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Teks:\n\n${text}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API Error:", errorData);
      return NextResponse.json(
        { error: `Gagal terhubung ke AI: ${errorData.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    // Bersihkan markdown wrapper jika ada
    const cleanContent = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    
    let quizData;
    try {
      quizData = JSON.parse(cleanContent);
    } catch (e) {
      throw new Error("Format JSON dari AI tidak valid");
    }
    
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Format JSON tidak valid");
    }

    return NextResponse.json({ questions: quizData.questions });

  } catch (error: unknown) {
    console.error("Quiz Backend Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal peladen saat membuat kuis." },
      { status: 500 }
    );
  }
}
