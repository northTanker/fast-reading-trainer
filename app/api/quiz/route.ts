import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, apiKey } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Teks tidak boleh kosong" }, { status: 400 });
    }

    const token = apiKey || process.env.DEEPSEEK_API_KEY;

    if (!token) {
      return NextResponse.json(
        { error: "Kunci API tidak ditemukan. Silakan gunakan kunci pribadi Anda." },
        { status: 401 }
      );
    }

    const wordCount = text.trim().split(/\s+/).length;
    let questionCount = 3;
    if (wordCount > 500) questionCount = 5;
    if (wordCount > 1000) questionCount = 7;

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
    
    const parsed = JSON.parse(content);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Format JSON tidak valid");
    }

    return NextResponse.json({ questions: parsed.questions });

  } catch (error: unknown) {
    console.error("Quiz Backend Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal peladen saat membuat kuis." },
      { status: 500 }
    );
  }
}
