export type SessionState = "idle" | "reading" | "paused" | "finished";

export interface SessionRecord {
  id: string;
  date: string;
  textPreview: string;
  wordCount: number;
  wpmSetting: number;
  actualWpm: number;
  durationMs: number;
  completed: boolean;
  source?: "manual" | "catalog" | "ai";
  title?: string;
  quizScore?: number; // 0-100 percentage
}

export interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalWordsRead: number;
  bestWpm: number;
  unlockedBadges: string[];
  xp: number;
  level: number;
}

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  check: (stats: GamificationData, history: SessionRecord[]) => boolean;
}

export interface ReaderState {
  sessionState: SessionState;
  words: string[];
  wordIndex: number;
  wpm: number;
}

export interface SavedText {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export type QuizDifficulty = "mudah" | "sedang" | "sulit";
