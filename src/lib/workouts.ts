import { datesInRange, formatDate, weekBounds } from "./journey";
import type {
  LiftType,
  WorkoutCategory,
  WorkoutLog,
  WorkoutPr,
} from "./types";

export const LIFT_TYPES: { id: LiftType; label: string }[] = [
  { id: "hiit", label: "HIIT" },
  { id: "stretch", label: "Stretch" },
  { id: "weights", label: "Weights" },
];

export function liftTypeLabel(type: LiftType | undefined): string {
  return LIFT_TYPES.find((t) => t.id === type)?.label ?? "Lift";
}

/** Legacy rows without category default to weights lift */
export function normalizeWorkout(raw: WorkoutLog): WorkoutLog {
  return {
    ...raw,
    category: raw.category ?? "lift",
    liftType: raw.category === "run" ? undefined : (raw.liftType ?? "weights"),
  };
}

export function normalizeWorkouts(
  workouts: WorkoutLog[] | undefined,
): WorkoutLog[] {
  return (workouts ?? []).map(normalizeWorkout);
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
  hasRun: boolean;
  hasLift: boolean;
  liftTypes: LiftType[];
};

export function summarizeDay(workouts: WorkoutLog[]): DayWorkoutSummary {
  const runs = workouts.filter((w) => w.category === "run");
  const lifts = workouts.filter((w) => w.category === "lift");
  return {
    hasRun: runs.length > 0,
    hasLift: lifts.length > 0,
    liftTypes: [...new Set(lifts.map((w) => w.liftType ?? "weights"))],
  };
}

export function weekRunMiles(
  workouts: WorkoutLog[] | undefined,
  anchorDate: string,
): number {
  const { start, end } = weekBounds(anchorDate);
  const week = new Set(datesInRange(start, end));
  return normalizeWorkouts(workouts)
    .filter((w) => w.category === "run" && week.has(w.date))
    .reduce((sum, w) => sum + (w.distanceMiles ?? 0), 0);
}

export function monthRunMiles(
  workouts: WorkoutLog[] | undefined,
  year: number,
  month: number,
): number {
  const prefix = monthKey(year, month);
  return normalizeWorkouts(workouts)
    .filter((w) => w.category === "run" && w.date.startsWith(prefix))
    .reduce((sum, w) => sum + (w.distanceMiles ?? 0), 0);
}

export function prsForCategory(
  prs: WorkoutPr[] | undefined,
  category: WorkoutCategory,
  liftType?: LiftType,
): WorkoutPr[] {
  return (prs ?? [])
    .filter(
      (p) =>
        p.category === category &&
        (liftType == null || p.liftType === liftType),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
}

export function formatMiles(n: number): string {
  if (n === 0) return "0";
  return n < 10 ? n.toFixed(1) : String(Math.round(n * 10) / 10);
}
