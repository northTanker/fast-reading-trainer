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
}

export interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalWordsRead: number;
  bestWpm: number;
  unlockedBadges: string[];
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
