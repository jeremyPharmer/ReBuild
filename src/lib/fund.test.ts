import { describe, expect, it } from "vitest";
import {
  availableShopRewards,
  claimCelebration,
  eligibleWishlist,
  eligibleWishlistForIncentive,
  executeWishlist,
  fundTotal,
  lastShopReward,
  mustTreat,
  normalizeFund,
  projectedTreatYourselfAt,
  saveForFuture,
  shoppingTreatBudget,
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
  it("splits 30/70 Future / Treat on transfer by default", () => {
    expect(splitTransfer(100)).toEqual({
      future: 30,
      treat: 70,
    });
    let state = base();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      stress: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    expect(fundTotal(state.fund)).toBe(40);
    expect(state.fund).toEqual({ future: 12, treat: 28 });
  });

  it("honors profile treatSplit on transfer", () => {
    expect(splitTransfer(100, 0.6)).toEqual({ future: 40, treat: 60 });
    let state = base();
    state.profile = { ...state.profile!, treatSplit: 0.6 };
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      stress: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    expect(state.fund).toEqual({ future: 16, treat: 24 });
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
        stress: 2,
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
    state = saveForFuture(state, ms.id, "Walked the block");
    expect(state.fund).toEqual(before);
    expect(state.consecutiveSaves).toBe(1);
    expect(mustTreat(state)).toBe(false);
    expect(state.milestoneDecisions[0].note).toBe("Walked the block");
    expect(state.milestoneDecisions[0].rewardId).toBeTruthy();
    expect(state.rewards.some((r) => r.executed && r.name === "Walked the block")).toBe(true);
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

  it("debits the actual spend when it differs from estimated", () => {
    let state = base();
    state = {
      ...state,
      fund: { future: 20, treat: 50 },
      rewards: [
        {
          id: "r_act",
          name: "Massage",
          category: "wellness",
          estimatedCost: 40,
          executed: false,
          createdAt: "",
        },
      ],
      milestones: [
        {
          id: "ms_act",
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
    state = treatYourself(
      state,
      "ms_act",
      "r_act",
      undefined,
      undefined,
      undefined,
      32,
    );
    expect(state.fund).toEqual({ future: 20, treat: 18 });
    expect(state.rewards.find((r) => r.id === "r_act")?.actualCost).toBe(32);
    expect(state.milestoneDecisions[0].amount).toBe(32);
  });

  it("forces treat after two saves for the future", () => {
    let state = base();
    for (let i = 1; i <= 7; i++) {
      const day = `2026-08-${String(i).padStart(2, "0")}`;
      state = applyEveningSideEffects(state, {
        date: day,
        mood: 7,
        stress: 2,
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
    state = saveForFuture(state, ms3.id, "Quiet morning");
    state = saveForFuture(state, ms7.id, "Called a friend");
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
    expect(() => saveForFuture(state, fake.id, "Nope")).toThrow(
      /Treat Yourself required/,
    );
    state = treatYourself(state, fake.id, "r2", "small win");
    expect(state.consecutiveSaves).toBe(0);
    expect(state.rewards.find((r) => r.id === "r2")?.executed).toBe(true);
  });

  it("claims a free-text celebration without debiting funds", () => {
    let state = base();
    state = {
      ...state,
      milestones: [
        {
          id: "ms_c",
          dayNumber: 3,
          title: "First Win",
          type: "reward",
          runId: "run_1",
          cleanDaysAtAchieve: 3,
          achievedAt: "",
          rewardEligible: true,
        },
      ],
      fund: { future: 40, treat: 20 },
    };
    state = claimCelebration(state, "ms_c", "Sunset walk", "felt calm", "photo_1.jpg");
    expect(state.fund).toEqual({ future: 40, treat: 20 });
    expect(state.consecutiveSaves).toBe(0);
    expect(state.milestoneDecisions[0].choice).toBe("treat");
    expect(state.milestoneDecisions[0].amount).toBe(0);
    expect(state.rewards[0].name).toBe("Sunset walk");
    expect(state.rewards[0].photoId).toBe("photo_1.jpg");
    expect(state.rewards[0].executed).toBe(true);
  });

  it("Treat Yourself available = current Treat + accrual through target day", () => {
    let state = base();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      stress: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    // treat now = 28; Day 3 → 2 days × $40 × 0.7 = 56; total = 84
    expect(projectedTreatYourselfAt(state, 3, "2026-08-01")).toBe(84);
  });

  it("honors profile treatSplit when projecting Treat Yourself", () => {
    let state = base();
    state.profile = { ...state.profile!, treatSplit: 0.6 };
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      stress: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    // treat now = 24; Day 3 → 2 days × $40 × 0.6 = 48; total = 72
    expect(projectedTreatYourselfAt(state, 3, "2026-08-01")).toBe(72);
  });

  it("next-incentive wishlist uses projected Treat, not today's Treat bank", () => {
    let state = base();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      stress: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    // treat now = 28; projected Treat at Day 3 = 84
    state = {
      ...state,
      rewards: [
        {
          id: "r_now",
          name: "Coffee",
          category: "other",
          estimatedCost: 20,
          executed: false,
          createdAt: "",
        },
        {
          id: "r_later",
          name: "Dinner",
          category: "experiences",
          estimatedCost: 70,
          executed: false,
          createdAt: "",
        },
        {
          id: "r_too_much",
          name: "Weekend trip",
          category: "experiences",
          estimatedCost: 200,
          executed: false,
          createdAt: "",
        },
        {
          id: "r_assigned",
          name: "Already picked",
          category: "other",
          estimatedCost: 90,
          assignedMilestoneDay: 3,
          executed: false,
          createdAt: "",
        },
      ],
    };
    expect(state.fund.treat).toBe(28);
    expect(eligibleWishlistForIncentive(state, 3, "2026-08-01").map((r) => r.id)).toEqual(
      ["r_now", "r_later", "r_assigned"],
    );
  });

  it("shop budget is Treat earned through last unclaimed reward, not running Treat", () => {
    let state = base();
    state.rewards = [
      {
        id: "r_shop",
        name: "Dinner",
        category: "experiences",
        estimatedCost: 80,
        executed: false,
        createdAt: "",
      },
      {
        id: "r_later",
        name: "Trip",
        category: "travel",
        estimatedCost: 120,
        executed: false,
        createdAt: "",
      },
    ];

    for (let i = 1; i <= 5; i++) {
      const day = `2026-08-0${i}`;
      state = applyEveningSideEffects(state, {
        date: day,
        mood: 7,
        stress: 2,
        alignment: "aligned",
        oneLine: `${i}`,
        completedAt: "",
      });
      state = confirmTransfer(state, [day], 40);
    }

    // Running Treat = 5 × $28 = $140. Day 3 still unclaimed (Day 5 is checkpoint).
    expect(state.fund.treat).toBe(140);
    expect(lastShopReward(state)?.dayNumber).toBe(3);
    expect(shoppingTreatBudget(state)).toBe(84);
    expect(availableShopRewards(state).map((r) => r.id)).toEqual(["r_shop"]);

    state = executeWishlist(state, "r_shop", 80);
    expect(state.rewards.find((r) => r.id === "r_shop")?.executed).toBe(true);
    expect(state.milestoneDecisions[0]?.dayNumber).toBe(3);
    expect(shoppingTreatBudget(state)).toBe(0);
    expect(state.fund.treat).toBe(60);
  });

  it("Save for the Future keeps the Day 7 shop window open", () => {
    let state = base();
    state.rewards = [
      {
        id: "r_shop",
        name: "Dinner",
        category: "experiences",
        estimatedCost: 80,
        executed: false,
        createdAt: "",
      },
    ];
    for (let i = 1; i <= 9; i++) {
      const day = `2026-08-${String(i).padStart(2, "0")}`;
      state = applyEveningSideEffects(state, {
        date: day,
        mood: 7,
        stress: 2,
        alignment: "aligned",
        oneLine: `${i}`,
        completedAt: "",
      });
      state = confirmTransfer(state, [day], 40);
    }
    const day7 = state.milestones.find((m) => m.dayNumber === 7)!;
    state = saveForFuture(state, day7.id, "Walked instead");
    // Running Treat = 9 × $28 = $252. Shop is still Day 7 = 7 × $28 = $196.
    expect(lastShopReward(state)?.dayNumber).toBe(7);
    expect(state.fund.treat).toBe(252);
    expect(shoppingTreatBudget(state)).toBe(196);
    state = executeWishlist(state, "r_shop", 80);
    expect(state.rewards.find((r) => r.id === "r_shop")?.executed).toBe(true);
    expect(state.fund.treat).toBe(172);
    expect(shoppingTreatBudget(state)).toBe(116);
  });

  it("shop stays closed until a reward is ready to claim", () => {
    let state = base();
    state = applyEveningSideEffects(state, {
      date: "2026-08-01",
      mood: 7,
      stress: 2,
      alignment: "aligned",
      oneLine: "a",
      completedAt: "",
    });
    state = confirmTransfer(state, ["2026-08-01"], 40);
    state.rewards = [
      {
        id: "r1",
        name: "Coffee",
        category: "other",
        estimatedCost: 10,
        executed: false,
        createdAt: "",
      },
    ];
    expect(lastShopReward(state)).toBeUndefined();
    expect(shoppingTreatBudget(state)).toBe(0);
    expect(() => executeWishlist(state, "r1")).toThrow(/reward is ready/);
  });
});
