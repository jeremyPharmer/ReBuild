import { addDays, calendarDaysBetween, formatDisplayDate } from "./journey";
import type { RebuildState } from "./types";

export type TrendMetric =
  | "sleepQuality"
  | "mood"
  | "energy"
  | "stress"
  | "craving";

export type TrendPoint = {
  date: string;
  sleepQuality?: number;
  mood?: number;
  energy?: number;
  stress?: number;
  craving?: number;
};

/** Prefer morning state metrics; fill mood/craving from evening if needed. */
export function trendPointsLastYear(
  state: RebuildState,
  asOfDate: string,
): TrendPoint[] {
  const startBound = addDays(asOfDate, -364);
  const byDate = new Map<string, TrendPoint>();

  for (const m of state.mornings) {
    if (m.date < startBound || m.date > asOfDate) continue;
    byDate.set(m.date, {
      date: m.date,
      sleepQuality: m.sleepQuality,
      mood: m.mood,
      energy: m.energy,
      stress: m.stress,
      craving: m.craving,
    });
  }

  for (const e of state.evenings) {
    if (e.date < startBound || e.date > asOfDate) continue;
    const existing = byDate.get(e.date) ?? { date: e.date };
    if (existing.mood === undefined) existing.mood = e.mood;
    if (existing.craving === undefined) existing.craving = e.craving;
    byDate.set(e.date, existing);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export const TREND_METRICS: {
  key: TrendMetric;
  label: string;
  color: string;
}[] = [
  { key: "sleepQuality", label: "Sleep", color: "#7fbf9a" },
  { key: "mood", label: "Mood", color: "#d4844a" },
  { key: "energy", label: "Energy", color: "#d4a24a" },
  { key: "stress", label: "Stress", color: "#c97060" },
  { key: "craving", label: "Craving", color: "#8b9dc3" },
];

export function formatTrendDate(date: string): string {
  return formatDisplayDate(date);
}

export function daysBetween(from: string, to: string): number {
  return calendarDaysBetween(from, to);
}
