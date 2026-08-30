import type { WorkoutLog } from "./types";

export function recentWorkouts(
  workouts: WorkoutLog[] | undefined,
  limit = 5,
): WorkoutLog[] {
  return [...(workouts ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function workoutsForDate(
  workouts: WorkoutLog[] | undefined,
  date: string,
): WorkoutLog[] {
  return (workouts ?? []).filter((w) => w.date === date);
}

export function gymWeekCount(
  workouts: WorkoutLog[] | undefined,
  weekDates: string[],
): number {
  const week = new Set(weekDates);
  return (workouts ?? []).filter((w) => week.has(w.date)).length;
}
