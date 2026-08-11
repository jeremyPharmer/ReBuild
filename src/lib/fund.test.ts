import { describe, expect, it } from "vitest";
import {
  eligibleWishlist,
  fundTotal,
  mustTreat,
  normalizeFund,
  saveForFuture,
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
  it("splits 50/50 Future / Treat on transfer", () => {
    expect(splitTransfer(100)).toEqual({
      future: 50,
      treat: 50,
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
    expect(state.fund).toEqual({ future: 20, treat: 20 });
  });

  it("folds the legacy Rebuild bucket into Future", () => {
    expect(normalizeFund({ future: 40, rebuild: 10, treat: 20 })).toEqual({
      future: 50,
      treat: 20,
    });
  });

  it("save for the future does not move money into Treat", () => {
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
    // fund 60/60
    const ms = state.milestones.find((m) => m.dayNumber === 3)!;
    const before = { ...state.fund };
    state = saveForFuture(state, ms.id);
    expect(state.fund).toEqual(before);
    expect(state.consecutiveSaves).toBe(1);
    expect(mustTreat(state)).toBe(false);
  });

  it("treat can pull from Future when Treat is short", () => {
    let state = base();
    state = {
      ...state,
      fund: { future: 40, treat: 5 },
      rewards: [
        {
          id: "r1",
          name: "Dinner",
          category: "experiences",
          estimatedCost: 30,
          executed: false,
          createdAt: "",
        },
      ],
      milestones: [
        {
          id: "ms1",
          dayNumber: 3,
          title: "First Win",
          type: "reward",
          runId: "run_1",
          cleanDaysAtAchieve: 3,
          achievedAt: "",
          rewardEligible: true,
        },
      ],
    };
    expect(eligibleWishlist(state).map((r) => r.id)).toEqual(["r1"]);
    expect(() => treatYourself(state, "ms1", "r1", "nice")).toThrow(
      /pull more from Future/,
    );
    state = treatYourself(state, "ms1", "r1", "nice", 25);
    expect(state.fund).toEqual({ future: 15, treat: 0 });
    expect(state.rewards.find((r) => r.id === "r1")?.executed).toBe(true);
  });

  it("forces treat after two saves for the future", () => {
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
    state = saveForFuture(state, ms3.id);
    state = saveForFuture(state, ms7.id);
    expect(mustTreat(state)).toBe(true);

    state = {
      ...state,
      rewards: [
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
    expect(() => saveForFuture(state, fake.id)).toThrow(
      /Treat Yourself required/,
    );
    state = treatYourself(state, fake.id, "r2", "small win");
    expect(state.consecutiveSaves).toBe(0);
    expect(state.rewards.find((r) => r.id === "r2")?.executed).toBe(true);
  });
});
