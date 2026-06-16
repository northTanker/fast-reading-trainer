"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from "recharts";
import type { SessionRecord } from "@/types";

const EMPTY_HISTORY: SessionRecord[] = [];
let cachedHistory: SessionRecord[] = EMPTY_HISTORY;
let cachedHistoryRaw: string | null = null;

function getSnapshot(): SessionRecord[] {
  const raw = localStorage.getItem("reading-history");
  if (!raw) return EMPTY_HISTORY;
  if (cachedHistoryRaw === raw) return cachedHistory;
  try {
    const parsed = JSON.parse(raw);
    cachedHistoryRaw = raw;
    cachedHistory = Array.isArray(parsed) ? parsed : EMPTY_HISTORY;
    return cachedHistory;
  } catch {
    return EMPTY_HISTORY;
  }
}

function getServerSnapshot(): SessionRecord[] {
  return EMPTY_HISTORY;
}

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function AnalyticsChart() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Hanya ambil sesi yang punya skor kuis
  const data = useMemo(() => {
    return history
      .filter((session) => session.quizScore !== undefined)
      .map((session) => ({
        wpm: Math.round(session.actualWpm),
        score: Math.round(session.quizScore!),
        date: new Date(session.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
  }, [history]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Belum ada data kuis untuk menampilkan analitik.<br/>
          Selesaikan beberapa sesi dengan kuis untuk melihat grafik Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Kecepatan vs Pemahaman</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Hubungan antara WPM dan skor kuis Anda</p>
        </div>
      </div>
      
      <div className="h-64 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
            <XAxis 
              type="number" 
              dataKey="wpm" 
              name="Kecepatan" 
              unit=" WPM" 
              tick={{ fontSize: 12, fill: '#888888' }}
              domain={['auto', 'auto']}
              label={{ value: "Kecepatan (WPM)", position: "insideBottom", offset: -10, fontSize: 12, fill: '#888888' }}
            />
            <YAxis 
              type="number" 
              dataKey="score" 
              name="Skor" 
              unit="%" 
              tick={{ fontSize: 12, fill: '#888888' }}
              domain={[0, 100]}
              label={{ value: "Skor Kuis (%)", angle: -90, position: "insideLeft", fontSize: 12, fill: '#888888' }}
            />
            <ZAxis type="category" dataKey="date" name="Waktu" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e4e4e7',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                color: '#18181b',
                backgroundColor: '#ffffff'
              }}
            />
            <Scatter name="Sesi" data={data} fill="#f59e0b" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
