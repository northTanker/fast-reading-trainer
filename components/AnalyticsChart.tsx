"use client";

import { useSyncExternalStore, useMemo } from "react";
import type { SessionRecord } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EMPTY_HISTORY: SessionRecord[] = [];
let cachedHistoryRaw: string | null = null;
let cachedHistory: SessionRecord[] = EMPTY_HISTORY;

function getSnapshot(): SessionRecord[] {
  const raw = localStorage.getItem("reading-history");
  if (!raw) return EMPTY_HISTORY;

  if (cachedHistoryRaw === raw) {
    return cachedHistory;
  }

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

  const data = useMemo(() => {
    if (history.length === 0) return [];

    // Mengambil 30 sesi terakhir yang selesai untuk grafik
    const completedSessions = history
      .filter((s) => s.completed)
      .slice(-30);

    return completedSessions.map((session, index) => {
      const date = new Date(session.date);
      return {
        name: `Sesi ${index + 1}`,
        wpm: session.actualWpm,
        target: session.wpmSetting,
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };
    });
  }, [history]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-sm">
        <p>Belum ada data sesi yang diselesaikan.</p>
        <p className="text-xs mt-1 opacity-70">Selesaikan satu bacaan untuk melihat analitik WPM Anda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Perkembangan WPM
        </h3>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: '500'
              }}
              itemStyle={{ fontWeight: '700' }}
            />
            <Line
              type="monotone"
              dataKey="wpm"
              name="WPM Aktual"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target WPM"
              stroke="#a1a1aa"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
