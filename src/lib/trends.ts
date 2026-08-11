import { addDays, calendarDaysBetween, formatDisplayDate } from "./journey";
import type { RebuildState } from "./types";

/**
 * Future (not built yet): craving timing charts —
 * - time-of-day: when cravings are logged (uses CravingEvent.at)
 * - day-of-week × intensity, plus an all-time view
 * Keep capturing `at` on every craving event so those charts can land later.
 */

export type ConditionMetric = "sleepQuality" | "mood" | "energy" | "stress";

export type TrendPoint = {
  date: string;
  sleepQuality?: number;
  mood?: number;
  energy?: number;
  stress?: number;
};

export type CravingPointsPoint = {
  date: string;
  /** Sum of intensityBefore for craving events that calendar day. */
  points: number;
};

function dateKeyFromIso(iso: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/** Morning state metrics (1–10). Mood can fall back to evening. No morning craving. */
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
    });
  }

  for (const e of state.evenings) {
    if (e.date < startBound || e.date > asOfDate) continue;
    const existing = byDate.get(e.date) ?? { date: e.date };
    if (existing.mood === undefined) existing.mood = e.mood;
    byDate.set(e.date, existing);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Daily craving points = sum of intensityBefore for events that day.
 * Ignores intensityAfter. Uses profile timezone when available.
 */
export function cravingPointsLastYear(
  state: RebuildState,
  asOfDate: string,
): CravingPointsPoint[] {
  const startBound = addDays(asOfDate, -364);
  const tz = state.profile?.timezone ?? "America/Los_Angeles";
  const byDate = new Map<string, number>();

  for (const c of state.cravings) {
    const date = dateKeyFromIso(c.at, tz);
    if (date < startBound || date > asOfDate) continue;
    const before = Number(c.intensityBefore);
    if (!Number.isFinite(before)) continue;
    byDate.set(date, (byDate.get(date) ?? 0) + before);
  }

  return [...byDate.entries()]
    .map(([date, points]) => ({ date, points }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const CONDITION_METRICS: {
  key: ConditionMetric;
  label: string;
  color: string;
}[] = [
  { key: "sleepQuality", label: "Sleep", color: "#7fbf9a" },
  { key: "mood", label: "Mood", color: "#d4844a" },
  { key: "energy", label: "Energy", color: "#d4a24a" },
  { key: "stress", label: "Stress", color: "#c97060" },
];

/** @deprecated use CONDITION_METRICS */
export const TREND_METRICS = CONDITION_METRICS;
export type TrendMetric = ConditionMetric;

export function formatTrendDate(date: string): string {
  return formatDisplayDate(date);
}

export function daysBetween(from: string, to: string): number {
  return calendarDaysBetween(from, to);
}

/** Round sleep hours to nearest half hour for capture/display. */
export function roundSleepHours(hours: number): number {
  if (!Number.isFinite(hours)) return 0;
  return Math.round(hours * 2) / 2;
}
