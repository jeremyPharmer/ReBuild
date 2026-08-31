import type { JournalEntry } from "./types";
import { addDays, formatDate, parseDate } from "./journey";

export type DayKey = `${string}-${string}`; // MM-DD

export type FiveYearEntry = {
  date: string;
  year: number;
  headline?: string;
  summary?: string;
  photoId?: string;
};

export type DayBundle = {
  date: string;
  headline?: string;
  summary?: string;
  photoId?: string;
};

/** Calendar month-day key from YYYY-MM-DD */
export function monthDayKey(isoDate: string): DayKey {
  return isoDate.slice(5) as DayKey;
}

/** Pretty month + day for a YYYY-MM-DD or MM-DD */
export function formatMonthDayLong(isoOrMd: string): string {
  const iso = isoOrMd.length === 5 ? `2000-${isoOrMd}` : isoOrMd;
  return parseDate(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

/** Soft sentence count for journal summaries (approx). */
export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return Math.max(1, parts.length);
}

export const SUMMARY_SENTENCE_SOFT_LIMIT = 5;

/** Group journal rows by full date → headline (one_line) + summary (journal). */
export function bundleJournalsByDate(
  journals: JournalEntry[],
): Map<string, DayBundle> {
  const byDate = new Map<string, DayBundle>();
  for (const j of journals) {
    const row = byDate.get(j.date) ?? { date: j.date };
    if (j.type === "one_line") {
      row.headline = j.text;
    } else if (j.type === "journal") {
      row.summary = j.text;
    }
    if (j.photoId && !row.photoId) {
      row.photoId = j.photoId;
    }
    byDate.set(j.date, row);
  }
  return byDate;
}

/**
 * Five year slots for a month-day, newest year first.
 * Always returns `years` slots (empty when no entry), anchored on `anchorYear`.
 */
export function fiveYearSlots(
  mmDd: DayKey,
  byDate: Map<string, DayBundle>,
  anchorYear: number,
  years = 5,
): FiveYearEntry[] {
  const slots: FiveYearEntry[] = [];
  for (let i = 0; i < years; i++) {
    const year = anchorYear - i;
    const date = `${year}-${mmDd}`;
    const bundled = byDate.get(date);
    slots.push({
      date,
      year,
      headline: bundled?.headline,
      summary: bundled?.summary,
      photoId: bundled?.photoId,
    });
  }
  return slots;
}

/** Shift a month-day by n calendar days within a reference year. */
export function shiftMonthDay(
  mmDd: DayKey,
  deltaDays: number,
  refYear: number,
): DayKey {
  const iso = `${refYear}-${mmDd}`;
  return monthDayKey(addDays(iso, deltaDays));
}

/** Today's month-day in a timezone-local today string. */
export function todayMonthDay(today: string): DayKey {
  return monthDayKey(today);
}

export function isLeapDay(mmDd: DayKey): boolean {
  return mmDd === "02-29";
}

/**
 * Build a concrete YYYY-MM-DD for a month-day in `year`.
 * Feb 29 in non-leap years → Feb 28.
 */
export function dateForYear(mmDd: DayKey, year: number): string {
  if (mmDd === "02-29") {
    const probe = parseDate(`${year}-02-29`);
    if (formatDate(probe) !== `${year}-02-29`) {
      return `${year}-02-28`;
    }
  }
  return `${year}-${mmDd}`;
}
