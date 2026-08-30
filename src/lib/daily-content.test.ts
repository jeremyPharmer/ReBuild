import { describe, expect, it } from "vitest";
import {
  dateSeed,
  pickGeneralSourcesForDay,
  pickTodaysContent,
} from "./daily-content";

describe("pickTodaysContent", () => {
  it("returns 1 recovery + 2 general podcasts", () => {
    const items = pickTodaysContent("2026-08-30", []);
    expect(items).toHaveLength(3);
    expect(items.filter((i) => i.slot === "recovery")).toHaveLength(1);
    expect(items.filter((i) => i.slot === "general")).toHaveLength(2);
    expect(items[0].kind).toBe("podcast");
  });

  it("rotates general sources by date", () => {
    const a = pickGeneralSourcesForDay("2026-08-30");
    const b = pickGeneralSourcesForDay("2026-08-31");
    expect(a[0]).not.toBe(a[1]);
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
