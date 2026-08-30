import { datesInRange, formatDate, weekBounds } from "./journey";
import type {
  LiftType,
  WorkoutCategory,
  WorkoutLog,
  WorkoutPr,
  WorkoutType,
} from "./types";

export const WORKOUT_TYPES: { id: WorkoutType; label: string }[] = [
  { id: "run", label: "Run" },
  { id: "hiit", label: "HIIT" },
  { id: "lift", label: "Lift" },
  { id: "stretch", label: "Stretch" },
];

export const WORKOUT_PRESETS: Record<WorkoutType, string[]> = {
  run: ["Easy run", "Long run", "Tempo", "Intervals", "Recovery jog", "5K", "10K"],
  hiit: ["Tabata", "Circuit", "AMRAP", "EMOM", "Boot camp", "Sprints"],
  lift: ["Upper body", "Lower body", "Full body", "Push day", "Pull day", "Leg day"],
  stretch: ["Yoga", "Mobility", "Foam roll", "Static stretch", "Recovery flow"],
};

export const WORKOUT_CUSTOM = "__custom__";

export const WORKOUT_QUALITY_MAX = 5;

const WORKOUT_TYPE_SET = new Set<WorkoutType>(
  WORKOUT_TYPES.map((t) => t.id),
);

/** Clamp quality to 1–5; missing/invalid → undefined */
export function normalizeQuality(raw: unknown): number | undefined {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > WORKOUT_QUALITY_MAX) return undefined;
  return rounded;
}

export function workoutTypeLabel(type: WorkoutType | undefined): string {
  return WORKOUT_TYPES.find((t) => t.id === type)?.label ?? "Workout";
}

function legacyTypeFromRow(
  category?: WorkoutCategory,
  liftType?: LiftType,
): WorkoutType {
  if (category === "run") return "run";
  if (liftType === "hiit") return "hiit";
  if (liftType === "stretch") return "stretch";
  return "lift";
}

function resolveWorkoutType(raw: {
  type?: WorkoutType;
  category?: WorkoutCategory;
  liftType?: LiftType;
}): WorkoutType {
  if (raw.type && WORKOUT_TYPE_SET.has(raw.type)) return raw.type;
  return legacyTypeFromRow(raw.category, raw.liftType);
}

/** Legacy rows without type default to lift; lift+weights → lift */
export function normalizeWorkout(raw: WorkoutLog): WorkoutLog {
  const type = resolveWorkoutType(raw);
  const quality = normalizeQuality(raw.quality);
  return { ...raw, type, quality };
}

export function normalizeWorkoutPr(raw: WorkoutPr): WorkoutPr {
  const type = resolveWorkoutType(raw);
  return { ...raw, type };
}

export function normalizeWorkouts(
  workouts: WorkoutLog[] | undefined,
): WorkoutLog[] {
  return (workouts ?? []).map(normalizeWorkout);
}

export function normalizeWorkoutPrs(
  prs: WorkoutPr[] | undefined,
): WorkoutPr[] {
  return (prs ?? []).map(normalizeWorkoutPr);
}

export function countsForDates(
  workouts: WorkoutLog[] | undefined,
  dates: Set<string>,
): Record<WorkoutType, number> {
  const counts: Record<WorkoutType, number> = {
    run: 0,
    hiit: 0,
    lift: 0,
    stretch: 0,
  };
  for (const w of normalizeWorkouts(workouts)) {
    if (dates.has(w.date)) counts[w.type!] += 1;
  }
  return counts;
}

export function minutesForDates(
  workouts: WorkoutLog[] | undefined,
  dates: Set<string>,
): number {
  return normalizeWorkouts(workouts)
    .filter((w) => dates.has(w.date))
    .reduce((sum, w) => sum + (w.durationMin ?? 0), 0);
}

/** Quality points: each session contributes its 1–5 quality score */
export function qualityPointsForDates(
  workouts: WorkoutLog[] | undefined,
  dates: Set<string>,
): number {
  return normalizeWorkouts(workouts)
    .filter((w) => dates.has(w.date))
    .reduce((sum, w) => sum + (w.quality ?? 0), 0);
}

export function recentWorkouts(
  workouts: WorkoutLog[] | undefined,
  limit = 5,
): WorkoutLog[] {
  return normalizeWorkouts(workouts)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function workoutsForDate(
  workouts: WorkoutLog[] | undefined,
  date: string,
): WorkoutLog[] {
  return normalizeWorkouts(workouts).filter((w) => w.date === date);
}

export function workoutsByDate(
  workouts: WorkoutLog[] | undefined,
): Map<string, WorkoutLog[]> {
  const map = new Map<string, WorkoutLog[]>();
  for (const w of normalizeWorkouts(workouts)) {
    const list = map.get(w.date) ?? [];
    list.push(w);
    map.set(w.date, list);
  }
  return map;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

export function shiftMonthKey(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKey(d.getFullYear(), d.getMonth() + 1);
}

/** Sunday-start weeks; null pads leading/trailing blanks */
export function buildMonthGrid(
  year: number,
  month: number,
): (string | null)[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = first.getDay();
  const days: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(formatDate(new Date(year, month - 1, d)));
  }
  while (days.length % 7 !== 0) days.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export type DayWorkoutSummary = {
  types: WorkoutType[];
};

export function summarizeDay(workouts: WorkoutLog[]): DayWorkoutSummary {
  return {
    types: [...new Set(workouts.map((w) => w.type!))],
  };
}

export type PeriodWorkoutSummary = {
  counts: Record<WorkoutType, number>;
  runMiles: number;
  totalMinutes: number;
  qualityPoints: number;
};

export function weekWorkoutSummary(
  workouts: WorkoutLog[] | undefined,
  anchorDate: string,
): PeriodWorkoutSummary {
  const { start, end } = weekBounds(anchorDate);
  const dates = new Set(datesInRange(start, end));
  return {
    counts: countsForDates(workouts, dates),
    runMiles: weekRunMiles(workouts, anchorDate),
    totalMinutes: minutesForDates(workouts, dates),
    qualityPoints: qualityPointsForDates(workouts, dates),
  };
}

export function monthWorkoutSummary(
  workouts: WorkoutLog[] | undefined,
  year: number,
  month: number,
): PeriodWorkoutSummary {
  const prefix = monthKey(year, month);
  const dates = new Set(
    normalizeWorkouts(workouts)
      .filter((w) => w.date.startsWith(prefix))
      .map((w) => w.date),
  );
  return {
    counts: countsForDates(workouts, dates),
    runMiles: monthRunMiles(workouts, year, month),
    totalMinutes: minutesForDates(workouts, dates),
    qualityPoints: qualityPointsForDates(workouts, dates),
  };
}

export function weekRunMiles(
  workouts: WorkoutLog[] | undefined,
  anchorDate: string,
): number {
  const { start, end } = weekBounds(anchorDate);
  const week = new Set(datesInRange(start, end));
  return normalizeWorkouts(workouts)
    .filter((w) => w.type === "run" && week.has(w.date))
    .reduce((sum, w) => sum + (w.distanceMiles ?? 0), 0);
}

export function monthRunMiles(
  workouts: WorkoutLog[] | undefined,
  year: number,
  month: number,
): number {
  const prefix = monthKey(year, month);
  return normalizeWorkouts(workouts)
    .filter((w) => w.type === "run" && w.date.startsWith(prefix))
    .reduce((sum, w) => sum + (w.distanceMiles ?? 0), 0);
}

export function prsForType(
  prs: WorkoutPr[] | undefined,
  type: WorkoutType,
): WorkoutPr[] {
  return normalizeWorkoutPrs(prs)
    .filter((p) => p.type === type)
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
}

export function formatMiles(n: number): string {
  if (n === 0) return "0";
  return n < 10 ? n.toFixed(1) : String(Math.round(n * 10) / 10);
}

export function gymSupportForType(type: WorkoutType): boolean {
  return type !== "run";
}
