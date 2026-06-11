import { z } from "zod";
import type { SessionRecord, GamificationData } from "@/types";

const HISTORY_KEY = "reading-history";
const GAMIFICATION_KEY = "gamification-data";

export const sessionRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  textPreview: z.string(),
  wordCount: z.number(),
  wpmSetting: z.number(),
  actualWpm: z.number(),
  durationMs: z.number(),
  completed: z.boolean(),
});

export const gamificationDataSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  totalSessions: z.number(),
  totalWordsRead: z.number(),
  bestWpm: z.number(),
  unlockedBadges: z.array(z.string()),
});

export function getHistory(): SessionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = z.array(sessionRecordSchema).safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    console.error("Failed to parse reading history", result.error);
    return [];
  } catch {
    return [];
  }
}

export function saveSession(record: SessionRecord): void {
  if (typeof window === "undefined") return;

  const history = getHistory();
  history.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(GAMIFICATION_KEY);
}

export function getGamificationData(): GamificationData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = gamificationDataSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    console.error("Failed to parse gamification data", result.error);
    return null;
  } catch {
    return null;
  }
}

export function saveGamificationData(data: GamificationData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
}
