import { describe, expect, it } from "vitest";
import { emptyState } from "./journey";
import { trendPointsLastYear } from "./trends";
import { DEFAULT_SUPPORTS } from "./types";

describe("trendPointsLastYear", () => {
  it("builds points from mornings within the window", () => {
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
  });
});
