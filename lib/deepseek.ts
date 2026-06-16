import type { QuizQuestion, QuizDifficulty } from "@/types";

export async function generateQuiz(
  text: string,
  clientApiKey?: string,
  difficulty: QuizDifficulty = "sedang"
): Promise<QuizQuestion[]> {
  try {
    const body: Record<string, string> = { text, difficulty };
    if (clientApiKey) {
      body.apiKey = clientApiKey;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Jika TIDAK menggunakan custom API Key, kita butuh otentikasi Firebase
    if (!clientApiKey) {
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Anda harus masuk (login) untuk menggunakan fitur AI gratis.");
      }
      const idToken = await user.getIdToken();
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const response = await fetch("/api/quiz", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat membuat kuis.");
  }
}
