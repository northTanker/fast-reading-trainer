import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { z } from "zod";

const quizSchema = z.object({
  text: z.string().min(1, "Teks tidak boleh kosong").max(50000),
  apiKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = quizSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { text, apiKey } = parsed.data;

    const token = apiKey || process.env.DEEPSEEK_API_KEY;

    if (!token) {
      return NextResponse.json(
        { error: "Kunci API tidak ditemukan. Silakan gunakan kunci pribadi Anda." },
        { status: 401 }
      );
    }

    const wordCount = text.trim().split(/\s+/).length;
    let questionCount = 5;
    if (wordCount > 500) questionCount = 7;
    if (wordCount > 1000) questionCount = 10;

    const systemPrompt = `Anda adalah asisten pembuat kuis pemahaman membaca. Buatlah ${questionCount} pertanyaan pilihan ganda berdasarkan teks yang diberikan.
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
