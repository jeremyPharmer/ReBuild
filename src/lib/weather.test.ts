import { describe, expect, it } from "vitest";
import { dayLabel, weatherCodeMeta } from "./weather";

describe("weatherCodeMeta", () => {
  it("maps clear and rain codes", () => {
    expect(weatherCodeMeta(0).icon).toBe("☀️");
    expect(weatherCodeMeta(61).label).toBe("Rain");
    expect(weatherCodeMeta(95).icon).toBe("⛈️");
  });
});

describe("dayLabel", () => {
  it("labels today vs other days", () => {
    expect(dayLabel("2026-08-30", "2026-08-30")).toBe("Today");
    expect(dayLabel("2026-08-31", "2026-08-30")).toMatch(
      /Mon|Tue|Wed|Thu|Fri|Sat|Sun/,
    );
  });
});
