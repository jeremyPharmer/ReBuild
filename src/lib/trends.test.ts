import { describe, expect, it } from "vitest";
import { emptyState } from "./journey";
import {
  cravingPointsLastYear,
  roundSleepHours,
  trendPointsLastYear,
} from "./trends";
import { DEFAULT_SUPPORTS } from "./types";

function baseState() {
  const state = emptyState();
  state.profile = {
    id: "u",
    createdAt: "",
    onboarded: true,
    displayName: "J",
    historicalDailySpend: 10,
    startDate: "2026-08-10",
    currentRunId: "run_1",
    currentRunStartedOn: "2026-08-10",
    supports: DEFAULT_SUPPORTS,
    timezone: "America/New_York",
  };
  return state;
}

describe("trendPointsLastYear", () => {
  it("builds points from mornings within the window without craving", () => {
    const state = baseState();
    state.mornings = [
      {
        date: "2026-08-10",
        sleepHours: 7.5,
        sleepQuality: 6,
        mood: 5,
        energy: 4,
        stress: 7,
        craving: 3,
        intention: "x",
        completedAt: "",
      },
      {
        date: "2025-01-01",
        sleepHours: 8,
        sleepQuality: 8,
        mood: 8,
        energy: 8,
        stress: 2,
        craving: 1,
        intention: "old",
        completedAt: "",
      },
    ];
    const points = trendPointsLastYear(state, "2026-08-11");
    expect(points).toHaveLength(1);
    expect(points[0].date).toBe("2026-08-10");
    expect(points[0].sleepQuality).toBe(6);
    expect(points[0]).not.toHaveProperty("craving");
  });
});

describe("cravingPointsLastYear", () => {
  it("sums intensityBefore per day and ignores after", () => {
    const state = baseState();
    state.cravings = [
      {
        id: "c1",
        at: "2026-08-10T14:00:00.000Z",
        intensityBefore: 5,
        intensityAfter: 2,
        situation: "a",
        intervention: "walk",
      },
      {
        id: "c2",
        at: "2026-08-10T20:00:00.000Z",
        intensityBefore: 7,
        intensityAfter: 1,
        situation: "b",
        intervention: "call",
      },
      {
        id: "c3",
        at: "2026-08-11T12:00:00.000Z",
        intensityBefore: 3,
        situation: "c",
        intervention: "breathe",
      },
    ];
    const points = cravingPointsLastYear(state, "2026-08-11");
    expect(points).toEqual([
      { date: "2026-08-10", points: 12 },
      { date: "2026-08-11", points: 3 },
    ]);
  });
});

describe("roundSleepHours", () => {
  it("rounds to half-hour increments", () => {
    expect(roundSleepHours(7)).toBe(7);
    expect(roundSleepHours(7.2)).toBe(7);
    expect(roundSleepHours(7.3)).toBe(7.5);
    expect(roundSleepHours(7.75)).toBe(8);
  });
});
