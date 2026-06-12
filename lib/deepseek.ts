import type { QuizQuestion } from "@/types";

export async function generateQuiz(
  text: string,
  clientApiKey?: string
): Promise<QuizQuestion[]> {
  const apiKey = clientApiKey || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("API Key Deepseek tidak ditemukan.");
  }

  // Menyesuaikan jumlah soal berdasarkan panjang teks
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

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
      throw new Error(errorData.error?.message || `Gagal memanggil API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON
    const parsed = JSON.parse(content);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Format JSON tidak valid");
    }

    return parsed.questions as QuizQuestion[];
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat membuat kuis.");
  }
}
