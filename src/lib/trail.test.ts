import { describe, expect, it } from "vitest";
import { emptyState } from "./journey";
import { formatSleepHours, trailDaysThisRun } from "./trail";
import { DEFAULT_SUPPORTS } from "./types";

describe("formatSleepHours", () => {
  it("rounds to half-hour increments", () => {
    expect(formatSleepHours(7)).toBe("7");
    expect(formatSleepHours(7.2)).toBe("7");
    expect(formatSleepHours(7.3)).toBe("7.5");
    expect(formatSleepHours(7.75)).toBe("8");
  });
});

describe("trailDaysThisRun", () => {
  it("includes only activity days in the current run", () => {
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
        stress: 6,
        craving: 3,
        intention: "Listen more",
        completedAt: "",
      },
    ];
    state.cravings = [
      {
        id: "c1",
        at: "2026-08-10T20:00:00.000Z",
        intensityBefore: 7,
        intensityAfter: 3,
        situation: "Airport bar",
        intervention: "Walk",
        outcome: "Walk",
      },
    ];
    // Before current run — ignored
    state.evenings = [
      {
        date: "2026-08-01",
        mood: 5,
        stress: 2,
        alignment: "aligned",
        oneLine: "old climb",
        completedAt: "",
      },
    ];

    const days = trailDaysThisRun(state, "2026-08-11");
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe("2026-08-10");
    expect(days[0].dayNumber).toBe(1);
    expect(days[0].cravings).toHaveLength(1);
  });
});
