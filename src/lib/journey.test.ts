import { describe, expect, it } from "vitest";
import {
  buildDashboard,
  cleanDaysThisRun,
  nextMilestones,
  projectedReclaimAt,
  suggestedRewardPool,
  waitingReclaimTotal,
  weekBounds,
  weekFullyComplete,
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

describe("clean days and return reset", () => {
  it("counts only aligned days in current run", () => {
    let state = baseState();
    state.evenings = [
      {
        date: "2026-08-01",
        mood: 7,
        craving: 3,
        alignment: "aligned",
        oneLine: "ok",
        completedAt: "",
      },
      {
        date: "2026-08-02",
        mood: 6,
        craving: 4,
        alignment: "aligned",
        oneLine: "ok",
        completedAt: "",
      },
    ];
    expect(cleanDaysThisRun(state)).toBe(2);
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
    expect(cleanDaysThisRun(state)).toBe(3);
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
    expect(state.profile?.currentRunStartedOn).toBe("2026-08-05");
    expect(cleanDaysThisRun(state)).toBe(0);
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
    // 1 clean day, $40 waiting, 0 transferred → at day 3: waiting 40 + 2*40 = 120
    expect(projectedReclaimAt(state, 3)).toBe(120);
  });
});

describe("dashboard label", () => {
  it("uses ReBuilding for N days", () => {
    let state = baseState();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    const dash = buildDashboard(state, "2026-08-01");
    expect(dash?.label).toBe("ReBuilding for 1 day");
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
    expect(state.weeklyBonuses[0].amount).toBe(25);
  });
});
