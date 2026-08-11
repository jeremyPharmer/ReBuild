import { describe, expect, it } from "vitest";
import {
  buildDashboard,
  cleanDaysThisRun,
  formatSinceDate,
  nextIncentive,
  nextMilestones,
  projectedReclaimAt,
  suggestedRewardPool,
  waitingReclaimTotal,
  weekBounds,
  weekFullyComplete,
  weeklySupportProgress,
} from "./journey";
import { applyEveningSideEffects, confirmTransfer } from "./mutations";
import { DEFAULT_SUPPORTS, type RebuildState } from "./types";
import { emptyState } from "./journey";

function baseState(): RebuildState {
  const state = emptyState();
  state.profile = {
    id: "user_1",
    createdAt: new Date().toISOString(),
    onboarded: true,
    displayName: "Founder",
    historicalDailySpend: 40,
    startDate: "2026-08-01",
    currentRunId: "run_1",
    currentRunStartedOn: "2026-08-01",
    supports: DEFAULT_SUPPORTS,
    timezone: "America/Los_Angeles",
  };
  return state;
}

describe("weekBounds", () => {
  it("returns Sunday–Saturday", () => {
    // 2026-08-10 is a Monday
    const { start, end } = weekBounds("2026-08-10");
    expect(start).toBe("2026-08-09");
    expect(end).toBe("2026-08-15");
  });
});

describe("formatSinceDate", () => {
  it("formats without zero-padding", () => {
    expect(formatSinceDate("2026-08-10")).toBe("8-10-2026");
    expect(formatSinceDate("2026-12-01")).toBe("12-1-2026");
  });
});

describe("clean days and return reset", () => {
  it("counts calendar days from run start (Day 1 = start date)", () => {
    const state = baseState();
    // Start date itself is Day 1 — no evening required
    expect(cleanDaysThisRun(state, "2026-08-01")).toBe(1);
    expect(cleanDaysThisRun(state, "2026-08-02")).toBe(2);
    expect(cleanDaysThisRun(state, "2026-08-10")).toBe(10);
    expect(cleanDaysThisRun(state, "2026-07-31")).toBe(0);
  });

  it("resets run after return_to_use and keeps milestone history", () => {
    let state = baseState();
    for (let i = 1; i <= 3; i++) {
      const date = `2026-08-0${i}`;
      state = applyEveningSideEffects(state, {
        date,
        mood: 7,
        craving: 2,
        alignment: "aligned",
        oneLine: `day ${i}`,
        completedAt: new Date().toISOString(),
      });
    }
    expect(cleanDaysThisRun(state, "2026-08-03")).toBe(3);
    expect(state.milestones.some((m) => m.dayNumber === 3)).toBe(true);
    expect(state.reclaimDays).toHaveLength(3);

    state = applyEveningSideEffects(state, {
      date: "2026-08-04",
      mood: 4,
      craving: 8,
      alignment: "return_to_use",
      returnNotes: "stress",
      oneLine: "hard night",
      completedAt: new Date().toISOString(),
    });

    expect(state.returns).toHaveLength(1);
    expect(state.returns[0].previousCleanDays).toBe(3);
    expect(state.profile?.currentRunStartedOn).toBe("2026-08-05");
    // On the return day, new run hasn't started yet → 0 clean days
    expect(cleanDaysThisRun(state, "2026-08-04")).toBe(0);
    // New run Day 1 is the next calendar day
    expect(cleanDaysThisRun(state, "2026-08-05")).toBe(1);
    // history kept
    expect(state.milestones.some((m) => m.dayNumber === 3)).toBe(true);
    // return day does not create reclaim
    expect(state.reclaimDays.some((d) => d.date === "2026-08-04")).toBe(false);
  });

  it("allows re-achieving milestones on a new run", () => {
    let state = baseState();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "1",
      completedAt: "",
    });
    state = applyEveningSideEffects(state, {
      date: "2026-08-02",
      mood: 4,
      craving: 9,
      alignment: "return_to_use",
      oneLine: "storm",
      completedAt: "",
    });
    expect(state.returns[0].previousCleanDays).toBe(1);
    // new run starts 2026-08-03
    state = applyEveningSideEffects(state, {
      date: "2026-08-03",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "again",
      completedAt: "",
    });
    const day1Achieves = state.milestones.filter((m) => m.dayNumber === 1);
    expect(day1Achieves.length).toBe(2);
    expect(new Set(day1Achieves.map((m) => m.runId)).size).toBe(2);
  });
});

describe("reclaim transfer", () => {
  it("batches waiting days and writes off toward actual amount", () => {
    let state = baseState();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = applyEveningSideEffects(state, {
      date: "2026-08-02",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "b",
      completedAt: "",
    });
    expect(waitingReclaimTotal(state)).toBe(80);
    state = confirmTransfer(state, ["2026-08-01", "2026-08-02"], 70);
    expect(waitingReclaimTotal(state)).toBe(0);
    expect(state.transfers[0].amount).toBe(70);
  });
});

describe("milestones and projections", () => {
  it("suggests growing reward pools", () => {
    expect(suggestedRewardPool(3, 40)).toBeLessThan(
      suggestedRewardPool(30, 40),
    );
    expect(suggestedRewardPool(30, 40)).toBeLessThan(
      suggestedRewardPool(90, 40),
    );
  });

  it("lists next milestones after current clean days", () => {
    const next = nextMilestones(7, 3);
    expect(next.map((m) => m.dayNumber)).toEqual([10, 14, 21]);
  });

  it("skips checkpoints for next incentive", () => {
    // Day 1 → next milestone is Day 2 checkpoint, but next incentive is Day 3
    expect(nextMilestones(1, 1)[0]?.dayNumber).toBe(2);
    expect(nextIncentive(1)?.dayNumber).toBe(3);
    expect(nextIncentive(1)?.title).toBe("First Win");
    expect(nextIncentive(3)?.dayNumber).toBe(7);
  });

  it("projects reclaim at a future milestone", () => {
    let state = baseState();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    // As of Aug 1: 1 clean day, $40 waiting → at day 3: waiting 40 + 2*40 = 120
    expect(projectedReclaimAt(state, 3, "2026-08-01")).toBe(120);
  });
});

describe("dashboard label", () => {
  it("uses ReBuilding for N days from calendar asOf", () => {
    const state = baseState();
    // No evening yet — still Day 1 on the start date
    const dash = buildDashboard(state, "2026-08-01");
    expect(dash?.cleanDays).toBe(1);
    expect(dash?.label).toBe("ReBuilding for 1 day");
    expect(dash?.sinceLabel).toBe("ReBuilding since 8-1-2026");
  });
});

describe("weekly supports", () => {
  it("creates bonus when all targets hit", () => {
    let state = baseState();
    // Week of Aug 9–15 2026. Hit all targets on various days.
    const d = (n: number) => `2026-08-${String(n).padStart(2, "0")}`;
    const completions = [
      ...[10, 11].map((n) => ({
        date: d(n),
        supportType: "recovery_content" as const,
      })),
      ...[10, 11, 12, 13, 14].map((n) => ({
        date: d(n),
        supportType: "meditation" as const,
      })),
      ...[9, 10, 11, 12, 13, 14, 15].map((n) => ({
        date: d(n),
        supportType: "medication" as const,
      })),
      ...[10, 11, 12, 13].map((n) => ({
        date: d(n),
        supportType: "gym" as const,
      })),
    ];
    state.supports = completions.map((c) => ({
      ...c,
      completed: true,
      completedAt: "",
    }));
    expect(weekFullyComplete(state, "2026-08-10")).toBe(true);
    state = applyEveningSideEffects(state, {
      date: "2026-08-10",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "strong week",
      completedAt: "",
    });
    expect(state.weeklyBonuses).toHaveLength(1);
    expect(state.weeklyBonuses[0].amount).toBe(20);
  });

  it("does not count skipped supports toward weekly targets", () => {
    let state = baseState();
    state.skips = [
      {
        date: "2026-08-10",
        itemKey: "meditation",
        skippedAt: "",
      },
    ];
    // Skipped items are not marked completed — progress stays 0
    const week = weeklySupportProgress(state, "2026-08-10");
    const meditation = week.find((w) => w.type === "meditation");
    expect(meditation?.done).toBe(0);
  });
});
