import { describe, expect, it } from "vitest";
import {
  DAILY_ENTERTAINMENT_COUNT,
  DAILY_GENERAL_COUNT,
  DAILY_RECOVERY_COUNT,
  dateSeed,
  pickGeneralSourcesForDay,
  pickTodaysContent,
} from "./daily-content";

describe("pickTodaysContent", () => {
  it("returns 1 recovery + 4 general podcasts (5 total)", () => {
    const items = pickTodaysContent("2026-08-30", []);
    expect(items).toHaveLength(DAILY_ENTERTAINMENT_COUNT);
    expect(items.filter((i) => i.slot === "recovery")).toHaveLength(
      DAILY_RECOVERY_COUNT,
    );
    expect(items.filter((i) => i.slot === "general")).toHaveLength(
      DAILY_GENERAL_COUNT,
    );
    expect(items[0].kind).toBe("podcast");
  });

  it("rotates general sources by date", () => {
    const a = pickGeneralSourcesForDay("2026-08-30");
    const b = pickGeneralSourcesForDay("2026-08-31");
    expect(new Set(a).size).toBe(a.length);
    expect(a).not.toEqual(b);
  });

  it("is deterministic for the same date", () => {
    const first = pickTodaysContent("2026-08-30", []);
    const second = pickTodaysContent("2026-08-30", []);
    expect(first.map((i) => i.id)).toEqual(second.map((i) => i.id));
  });

  it("dateSeed differs across days", () => {
    expect(dateSeed("2026-08-30")).not.toBe(dateSeed("2026-08-31"));
  });
});
