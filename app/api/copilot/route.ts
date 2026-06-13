import { NextResponse } from "next/server";

export const runtime = 'edge';

// Fungsi utilitas untuk melakukan pencarian web menggunakan Tavily API
async function fetchTavilySearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.error("TAVILY_API_KEY tidak dikonfigurasi.");
    return "";
  }
  
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
        max_results: 5
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Tavily API error:", errorData);
      return "";
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    let context = "";
    if (data.answer) {
      context += `Ringkasan Cepat: ${data.answer}\n\n`;
    }
    if (data.results && data.results.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context += "Sumber Utama:\n" + data.results.map((r: any) => `- ${r.title}: ${r.content}`).join("\n");
    }
    return context;
  } catch (err) {
    console.error("Tavily Search error:", err);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, apiKey, mode = "generate", useSearch = false } = await req.json();

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

    let systemPrompt = mode === "format" 
      ? "Anda adalah asisten pemformatan teks tingkat lanjut. Tugas Anda adalah merapikan teks mentah hasil ekstraksi dokumen (PDF/Word) yang berantakan. Hapus jeda baris (enter) yang terpotong di tengah kalimat, gabungkan paragraf yang terputus, perbaiki tanda baca yang cacat, dan buang karakter sampah. JANGAN merangkum, memotong, atau mengubah makna asli teks. Kembalikan seluruh teks aslinya dengan format paragraf yang sangat rapi."
      : "Anda adalah Copilot AI untuk aplikasi Speed Reading. Tugas Anda adalah menulis artikel pendek, cerita, atau merangkum topik dengan bahasa yang jelas, format paragraf yang rapi, dan mudah dibaca cepat. Jangan gunakan format markdown yang rumit (hindari tebal/miring berlebihan, tabel, atau daftar kompleks). Hanya teks murni yang mengalir.";

    // Jika pengguna mengaktifkan pencarian web, ambil konteks dari Tavily
    if (useSearch && mode !== "format") {
      const searchContext = await fetchTavilySearch(prompt);
      if (searchContext) {
        systemPrompt += `\n\nPENTING: Berikut adalah konteks informasi terbaru dari internet yang relevan dengan permintaan pengguna (Hasil Pencarian Tavily). Gunakan informasi ini untuk menjawab agar akurat dan up-to-date:\n\n${searchContext}`;
      }
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // DeepSeek standard model, we'll try to use chat or reasoner
        stream: true,
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

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";

    const stream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && !trimmed.includes("[DONE]")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const content = parsed.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch (e) {
              // Ignore partial or invalid JSON
            }
          }
        }
      }
    });

    return new Response(response.body?.pipeThrough(stream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      }
    });

  } catch (error: unknown) {
    console.error("Copilot Backend Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal peladen." },
      { status: 500 }
    );
  }
}
