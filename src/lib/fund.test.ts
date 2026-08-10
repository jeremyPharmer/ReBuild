import { describe, expect, it } from "vitest";
import {
  eligibleWishlist,
  fundTotal,
  mustTreat,
  saveCompound,
  splitTransfer,
  treatYourself,
} from "./fund";
import { applyEveningSideEffects, confirmTransfer } from "./mutations";
import { emptyState } from "./journey";
import { DEFAULT_SUPPORTS, type RebuildState } from "./types";

function base(): RebuildState {
  const state = emptyState();
  state.profile = {
    id: "u",
    createdAt: "",
    onboarded: true,
    displayName: "F",
    historicalDailySpend: 40,
    startDate: "2026-08-01",
    currentRunId: "run_1",
    currentRunStartedOn: "2026-08-01",
    supports: DEFAULT_SUPPORTS,
    timezone: "UTC",
  };
  return state;
}

describe("fund split", () => {
  it("splits 50/25/25 on transfer", () => {
    expect(splitTransfer(100)).toEqual({
      future: 50,
      rebuild: 25,
      treat: 25,
    });
    let state = base();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      craving: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    expect(fundTotal(state.fund)).toBe(40);
    expect(state.fund).toEqual({ future: 20, rebuild: 10, treat: 10 });
  });

  it("save moves into treat; leftover vs suggested stays out", () => {
    let state = base();
    for (let i = 1; i <= 3; i++) {
      state = applyEveningSideEffects(state, {
        date: `2026-08-0${i}`,
        mood: 7,
        craving: 2,
        alignment: "aligned",
        oneLine: `${i}`,
        completedAt: "",
      });
    }
    state = confirmTransfer(
      state,
      ["2026-08-01", "2026-08-02", "2026-08-03"],
      120,
    );
    // fund 60/30/30
    const ms = state.milestones.find((m) => m.dayNumber === 3)!;
    state = saveCompound(state, ms.id, 50);
    expect(state.fund.treat).toBe(80); // 30 + 50
    expect(state.fund.rebuild + state.fund.future).toBe(40); // 120 - 80
    expect(state.consecutiveSaves).toBe(1);
    expect(mustTreat(state)).toBe(false);
  });

  it("forces treat after two saves; treat requires pool >= cost", () => {
    let state = base();
    for (let i = 1; i <= 7; i++) {
      const day = `2026-08-${String(i).padStart(2, "0")}`;
      state = applyEveningSideEffects(state, {
        date: day,
        mood: 7,
        craving: 2,
        alignment: "aligned",
        oneLine: `${i}`,
        completedAt: "",
      });
    }
    const days = Array.from({ length: 7 }, (_, i) =>
      `2026-08-${String(i + 1).padStart(2, "0")}`,
    );
    state = confirmTransfer(state, days, 280);

    const ms3 = state.milestones.find((m) => m.dayNumber === 3)!;
    const ms7 = state.milestones.find((m) => m.dayNumber === 7)!;
    // also day 1,2,5 checkpoints and day... only 3 and 7 are cashable among early
    state = saveCompound(state, ms3.id, 20);
    state = saveCompound(state, ms7.id, 20);
    expect(mustTreat(state)).toBe(true);

    state = {
      ...state,
      rewards: [
        {
          id: "r1",
          name: "Massage",
          category: "wellness",
          estimatedCost: 999,
          executed: false,
          createdAt: "",
        },
        {
          id: "r2",
          name: "Coffee",
          category: "experiences",
          estimatedCost: 8,
          executed: false,
          createdAt: "",
        },
      ],
    };
    expect(eligibleWishlist(state).map((r) => r.id)).toEqual(["r2"]);
    // Need another cashable without decision - use a fresh achievement
    const fake = {
      id: "ms_forced",
      dayNumber: 14,
      title: "Two Weeks",
      type: "reward" as const,
      runId: state.profile!.currentRunId,
      cleanDaysAtAchieve: 7,
      achievedAt: "",
      rewardEligible: true,
    };
    state = { ...state, milestones: [...state.milestones, fake] };
    expect(() => saveCompound(state, fake.id, 10)).toThrow(/Treat Yourself required/);
    state = treatYourself(state, fake.id, "r2", "small win");
    expect(state.consecutiveSaves).toBe(0);
    expect(state.rewards.find((r) => r.id === "r2")?.executed).toBe(true);
    expect(state.fund.treat).toBeLessThan(fundTotal(state.fund));
  });
});
