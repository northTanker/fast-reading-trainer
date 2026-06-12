import type { QuizQuestion } from "@/types";

export async function generateQuiz(
  text: string,
  clientApiKey?: string
): Promise<QuizQuestion[]> {
  try {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        apiKey: clientApiKey || undefined,
      }),
    });

    const data = await response.json();

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
