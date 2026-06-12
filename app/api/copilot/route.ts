import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, apiKey, mode = "generate" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt tidak boleh kosong" }, { status: 400 });
    }

    // Gunakan Kunci Pribadi (Option B) atau Kunci Server (Option C)
    const token = apiKey || process.env.DEEPSEEK_API_KEY;

    if (!token) {
      return NextResponse.json(
        { error: "Kunci API tidak ditemukan. Silakan gunakan kunci pribadi Anda." },
        { status: 401 }
      );
    }

    const systemPrompt = mode === "format" 
      ? "Anda adalah asisten pemformatan teks tingkat lanjut. Tugas Anda adalah merapikan teks mentah hasil ekstraksi dokumen (PDF/Word) yang berantakan. Hapus jeda baris (enter) yang terpotong di tengah kalimat, gabungkan paragraf yang terputus, perbaiki tanda baca yang cacat, dan buang karakter sampah. JANGAN merangkum, memotong, atau mengubah makna asli teks. Kembalikan seluruh teks aslinya dengan format paragraf yang sangat rapi."
      : "Anda adalah Copilot AI untuk aplikasi Speed Reading. Tugas Anda adalah menulis artikel pendek, cerita, atau merangkum topik dengan bahasa yang jelas, format paragraf yang rapi, dan mudah dibaca cepat. Jangan gunakan format markdown yang rumit (hindari tebal/miring berlebihan, tabel, atau daftar kompleks). Hanya teks murni yang mengalir.";

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // DeepSeek standard model, we'll try to use chat or reasoner
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
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
    const generatedText = data.choices[0]?.message?.content || "";

    return NextResponse.json({ text: generatedText });

  } catch (error: unknown) {
    console.error("Copilot Backend Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal peladen." },
      { status: 500 }
    );
  }
}
