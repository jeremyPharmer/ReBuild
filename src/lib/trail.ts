import {
  addDays,
  calendarDaysBetween,
  formatDisplayDate,
  formatSinceDate,
} from "./journey";
import type {
  CravingEvent,
  DayProvision,
  EveningCheckIn,
  MorningCheckIn,
  RebuildState,
  SupportCompletion,
} from "./types";

export type TrailDay = {
  date: string;
  dayNumber: number;
  morning?: MorningCheckIn;
  evening?: EveningCheckIn;
  supports: SupportCompletion[];
  provisions: DayProvision[];
  cravings: CravingEvent[];
};

/** Round to nearest half hour for display / capture. */
export function formatSleepHours(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  const rounded = Math.round(hours * 2) / 2;
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
}

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

/**
 * Days in the current run that have any activity
 * (morning, evening, support log, or craving).
 * Newest first.
 */
export function trailDaysThisRun(
  state: RebuildState,
  asOfDate: string,
): TrailDay[] {
  if (!state.profile) return [];
  const start = state.profile.currentRunStartedOn;
  const tz = state.profile.timezone;
  if (asOfDate < start) return [];

  const dates: string[] = [];
  for (let cur = start; cur <= asOfDate; cur = addDays(cur, 1)) {
    dates.push(cur);
  }

  const days: TrailDay[] = [];
  for (const date of dates) {
    const morning = state.mornings.find((m) => m.date === date);
    const evening = state.evenings.find((e) => e.date === date);
    const supports = state.supports.filter(
      (s) => s.date === date && s.completed,
    );
    const provisions = (state.dayProvisions ?? []).filter((p) => p.date === date);
    const cravings = state.cravings.filter(
      (c) => dateKeyFromIso(c.at, tz) === date,
    );
    const isToday = date === asOfDate;
    if (
      !isToday &&
      !morning &&
      !evening &&
      supports.length === 0 &&
      provisions.length === 0 &&
      cravings.length === 0
    ) {
      continue;
    }
    days.push({
      date,
      dayNumber: calendarDaysBetween(start, date) + 1,
      morning,
      evening,
      supports,
      provisions,
      cravings,
    });
  }

  return days.sort((a, b) => b.date.localeCompare(a.date));
}

export function trailDayLabel(day: TrailDay): string {
  return `Day ${day.dayNumber} · ${formatDisplayDate(day.date)}`;
}

export function alignmentTrailLabel(
  alignment: EveningCheckIn["alignment"],
): string {
  switch (alignment) {
    case "aligned":
      return "Made camp — stayed aligned";
    case "return_to_use":
      return "Storm weather";
    case "other":
      return "A different kind of day";
  }
}

export { formatSinceDate };
