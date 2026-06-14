import type { SessionRecord } from "@/types";

export function createSessionRecord(params: {
  text: string;
  words: string[];
  wpmSetting: number;
  durationMs: number;
  completed: boolean;
  source?: "manual" | "catalog" | "ai";
  title?: string;
}): SessionRecord {
  const { text, words, wpmSetting, durationMs, completed, source, title } = params;

  const actualWpm = durationMs > 0
    ? Math.round((words.length / (durationMs / 1000)) * 60)
    : 0;

  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: new Date().toISOString(),
    textPreview: text.slice(0, 100).replace(/\s+/g, " ").trim(),
    wordCount: words.length,
    wpmSetting,
    actualWpm,
    durationMs,
    completed,
    source,
    title,
  };
}
