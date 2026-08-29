import { describe, expect, it } from "vitest";
import {
  SUMMARY_SENTENCE_SOFT_LIMIT,
  bundleJournalsByDate,
  countSentences,
  fiveYearSlots,
  formatMonthDayLong,
  monthDayKey,
  shiftMonthDay,
  type DayKey,
} from "./journal";
import type { JournalEntry } from "./types";

function entry(
  partial: Pick<JournalEntry, "date" | "type" | "text"> & { id?: string },
): JournalEntry {
  return {
    id: partial.id ?? `${partial.date}-${partial.type}`,
    date: partial.date,
    type: partial.type,
    text: partial.text,
    createdAt: "2026-08-29T12:00:00.000Z",
  };
}

describe("journal five-year helpers", () => {
  it("extracts month-day keys", () => {
    expect(monthDayKey("2026-08-29")).toBe("08-29");
  });

  it("formats long month-day labels", () => {
    expect(formatMonthDayLong("08-29")).toBe("August 29");
    expect(formatMonthDayLong("2024-01-03")).toBe("January 3");
  });

  it("counts sentences softly", () => {
    expect(countSentences("")).toBe(0);
    expect(countSentences("One line")).toBe(1);
    expect(countSentences("One. Two. Three.")).toBe(3);
    expect(SUMMARY_SENTENCE_SOFT_LIMIT).toBe(5);
  });

  it("bundles one_line as headline and journal as summary", () => {
    const map = bundleJournalsByDate([
      entry({ date: "2026-08-29", type: "one_line", text: "Quiet morning" }),
      entry({
        date: "2026-08-29",
        type: "journal",
        text: "Walked the dog. Coffee on the porch.",
      }),
      entry({ date: "2025-08-29", type: "one_line", text: "Last year" }),
    ]);
    expect(map.get("2026-08-29")).toEqual({
      date: "2026-08-29",
      headline: "Quiet morning",
      summary: "Walked the dog. Coffee on the porch.",
    });
    expect(map.get("2025-08-29")?.headline).toBe("Last year");
  });

  it("builds five year slots newest-first with blanks", () => {
    const byDate = bundleJournalsByDate([
      entry({ date: "2026-08-29", type: "one_line", text: "This year" }),
      entry({ date: "2024-08-29", type: "one_line", text: "Two back" }),
    ]);
    const slots = fiveYearSlots("08-29" as DayKey, byDate, 2026, 5);
    expect(slots.map((s) => s.year)).toEqual([2026, 2025, 2024, 2023, 2022]);
    expect(slots[0].headline).toBe("This year");
    expect(slots[1].headline).toBeUndefined();
    expect(slots[2].headline).toBe("Two back");
  });

  it("shifts month-day across month boundaries", () => {
    expect(shiftMonthDay("08-29" as DayKey, 1, 2026)).toBe("08-30");
    expect(shiftMonthDay("08-01" as DayKey, -1, 2026)).toBe("07-31");
  });
});
