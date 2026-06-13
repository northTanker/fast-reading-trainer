import type { SessionRecord, GamificationData, BadgeDefinition } from "@/types";

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_session",
    label: "Langkah Pertama",
    description: "Selesaikan sesi membaca pertama Anda",
    check: (stats) => stats.totalSessions >= 1,
  },
  {
    id: "five_sessions",
    label: "Mulai Terbiasa",
    description: "Selesaikan 5 sesi membaca",
    check: (stats) => stats.totalSessions >= 5,
  },
  {
    id: "ten_sessions",
    label: "Berdedikasi",
    description: "Selesaikan 10 sesi membaca",
    check: (stats) => stats.totalSessions >= 10,
  },
  {
    id: "twenty_five_sessions",
    label: "Berkomitmen",
    description: "Selesaikan 25 sesi membaca",
    check: (stats) => stats.totalSessions >= 25,
  },
  {
    id: "fifty_sessions",
    label: "Sarjana",
    description: "Selesaikan 50 sesi membaca",
    check: (stats) => stats.totalSessions >= 50,
  },
  {
    id: "wpm_200",
    label: "Pembaca Cepat",
    description: "Mencapai kecepatan membaca 200 WPM",
    check: (stats) => stats.bestWpm >= 200,
  },
  {
    id: "wpm_250",
    label: "Pembaca Kilat",
    description: "Mencapai kecepatan membaca 250 WPM",
    check: (stats) => stats.bestWpm >= 250,
  },
  {
    id: "wpm_300",
    label: "Pembaca Elit",
    description: "Mencapai kecepatan membaca 300 WPM",
    check: (stats) => stats.bestWpm >= 300,
  },
  {
    id: "streak_3",
    label: "Membangun Momentum",
    description: "Membaca selama 3 hari berturut-turut",
    check: (stats) => stats.longestStreak >= 3,
  },
  {
    id: "streak_7",
    label: "Pejuang Mingguan",
    description: "Membaca selama 7 hari berturut-turut",
    check: (stats) => stats.longestStreak >= 7,
  },
  {
    id: "streak_14",
    label: "Dua Pekan",
    description: "Membaca selama 14 hari berturut-turut",
    check: (stats) => stats.longestStreak >= 14,
  },
  {
    id: "streak_30",
    label: "Tak Terhentikan",
    description: "Membaca selama 30 hari berturut-turut",
    check: (stats) => stats.longestStreak >= 30,
  },
  {
    id: "words_1000",
    label: "Pembaca Pemula",
    description: "Membaca total 1.000 kata",
    check: (stats) => stats.totalWordsRead >= 1000,
  },
  {
    id: "words_5000",
    label: "Kutu Buku",
    description: "Membaca total 5.000 kata",
    check: (stats) => stats.totalWordsRead >= 5000,
  },
  {
    id: "words_25000",
    label: "Bibliophile",
    description: "Membaca total 25.000 kata",
    check: (stats) => stats.totalWordsRead >= 25000,
  },
  {
    id: "words_100000",
    label: "Pustaka Berjalan",
    description: "Membaca total 100.000 kata",
    check: (stats) => stats.totalWordsRead >= 100000,
  },
];

export function computeGamification(
  history: SessionRecord[]
): GamificationData {
  const totalSessions = history.length;
  const totalWordsRead = history.reduce((sum, r) => sum + r.wordCount, 0);
  const bestWpm = history.reduce(
    (max, r) => (r.completed ? Math.max(max, r.actualWpm) : max),
    0
  );

  const dates = history
    .map((r) => r.date.slice(0, 10))
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .sort()
    .reverse();

  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (dates[i] === expectedStr) {
      currentStreak++;
    } else if (i === 0 && dates[i] !== today) {
      break;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let streak = 0;
  const sortedDates = dates.slice().sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);
  }

  const xp = totalWordsRead + (totalSessions * 50);
  const level = Math.floor(xp / 1000) + 1;

  const baseStats: GamificationData = {
    currentStreak,
    longestStreak,
    totalSessions,
    totalWordsRead,
    bestWpm,
    unlockedBadges: [],
    xp,
    level,
  };

  const unlockedBadges = BADGES
    .filter((b) => b.check(baseStats, history))
    .map((b) => b.id);

  return { ...baseStats, unlockedBadges };
}
