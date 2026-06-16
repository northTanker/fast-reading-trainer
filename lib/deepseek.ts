import type { QuizQuestion } from "@/types";

export async function generateQuiz(
  text: string,
  clientApiKey?: string
): Promise<QuizQuestion[]> {
  try {
    let response;
    
    if (clientApiKey) {
      // Call DeepSeek API directly
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

      response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${clientApiKey}`
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

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Gagal memanggil API (respons bukan JSON). Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error?.message || `Gagal memanggil API: ${response.status}`);
      }
      
      const content = data.choices?.[0]?.message?.content || "";
      
      // Membersihkan markdown wrapper (```json ... ```) jika AI tetap mengembalikannya
      const cleanContent = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanContent);
      } catch (e) {
        throw new Error("AI mengembalikan format yang tidak valid (bukan JSON).");
      }
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Format respons tidak valid dari peladen");
      }
      return parsed.questions as QuizQuestion[];

    } else {
      // Call our backend
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Anda harus masuk (login) untuk menggunakan fitur AI gratis.");
      }
      const idToken = await user.getIdToken();

      response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ text }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Gagal memanggil API (respons bukan JSON). Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Gagal memanggil API: ${response.status}`);
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Format respons tidak valid dari peladen");
      }

      return data.questions as QuizQuestion[];
    }
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat membuat kuis.");
  }
}
