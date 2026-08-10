import { newId } from "./journey";
import type {
  FundLedger,
  MilestoneAchievement,
  RebuildState,
  Reward,
} from "./types";

export function emptyFund(): FundLedger {
  return { future: 0, rebuild: 0, treat: 0 };
}

export function fundTotal(fund: FundLedger): number {
  return round2(fund.future + fund.rebuild + fund.treat);
}

export function normalizeState(state: RebuildState): RebuildState {
  const fund = state.fund ?? emptyFund();
  return {
    ...state,
    fund: {
      future: fund.future ?? 0,
      rebuild: fund.rebuild ?? 0,
      treat: fund.treat ?? 0,
    },
    consecutiveSaves: state.consecutiveSaves ?? 0,
    milestoneDecisions: state.milestoneDecisions ?? [],
  };
}

export function splitTransfer(amount: number): FundLedger {
  const future = round2(amount * 0.5);
  const rebuild = round2(amount * 0.25);
  const treat = round2(amount - future - rebuild);
  return { future, rebuild, treat };
}

export function applySplitToFund(
  fund: FundLedger,
  split: FundLedger,
): FundLedger {
  return {
    future: round2(fund.future + split.future),
    rebuild: round2(fund.rebuild + split.rebuild),
    treat: round2(fund.treat + split.treat),
  };
}

/**
 * Move `amount` into Treat from Rebuild first, then Future.
 * Returns updated fund and the actual amount moved.
 */
export function moveIntoTreat(
  fund: FundLedger,
  amount: number,
): { fund: FundLedger; moved: number } {
  let need = Math.max(0, amount);
  let rebuild = fund.rebuild;
  let future = fund.future;
  let treat = fund.treat;

  const fromRebuild = Math.min(rebuild, need);
  rebuild = round2(rebuild - fromRebuild);
  need = round2(need - fromRebuild);

  const fromFuture = Math.min(future, need);
  future = round2(future - fromFuture);
  need = round2(need - fromFuture);

  const moved = round2(fromRebuild + fromFuture);
  treat = round2(treat + moved);

  return { fund: { future, rebuild, treat }, moved };
}

export function pendingCashableMoments(
  state: RebuildState,
): MilestoneAchievement[] {
  const decided = new Set(
    state.milestoneDecisions.map((d) => d.milestoneAchievementId),
  );
  return state.milestones.filter(
    (m) =>
      m.rewardEligible &&
      !decided.has(m.id) &&
      (m.type === "reward" || m.type === "destination"),
  );
}

export function mustTreat(state: RebuildState): boolean {
  return (state.consecutiveSaves ?? 0) >= 2;
}

export function eligibleWishlist(state: RebuildState): Reward[] {
  const treat = state.fund?.treat ?? 0;
  return state.rewards.filter((r) => !r.executed && r.estimatedCost <= treat);
}

export function saveCompound(
  state: RebuildState,
  milestoneAchievementId: string,
  amount: number,
): RebuildState {
  const moment = state.milestones.find((m) => m.id === milestoneAchievementId);
  if (!moment || !moment.rewardEligible) {
    throw Object.assign(new Error("Milestone not cashable"), { status: 400 });
  }
  if (state.milestoneDecisions.some((d) => d.milestoneAchievementId === milestoneAchievementId)) {
    throw Object.assign(new Error("Already decided"), { status: 409 });
  }
  if (mustTreat(state)) {
    throw Object.assign(new Error("Treat Yourself required — Save not allowed"), {
      status: 400,
    });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw Object.assign(new Error("Save amount must be > 0"), { status: 400 });
  }

  const { fund, moved } = moveIntoTreat(state.fund, amount);
  if (moved <= 0) {
    throw Object.assign(
      new Error("Nothing available to move into Treat — reclaim money first"),
      { status: 400 },
    );
  }

  return {
    ...state,
    fund,
    consecutiveSaves: (state.consecutiveSaves ?? 0) + 1,
    milestoneDecisions: [
      ...state.milestoneDecisions,
      {
        id: newId("decision"),
        milestoneAchievementId,
        dayNumber: moment.dayNumber,
        choice: "save",
        amount: moved,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function treatYourself(
  state: RebuildState,
  milestoneAchievementId: string,
  rewardId: string,
  note?: string,
): RebuildState {
  const moment = state.milestones.find((m) => m.id === milestoneAchievementId);
  if (!moment || !moment.rewardEligible) {
    throw Object.assign(new Error("Milestone not cashable"), { status: 400 });
  }
  if (state.milestoneDecisions.some((d) => d.milestoneAchievementId === milestoneAchievementId)) {
    throw Object.assign(new Error("Already decided"), { status: 409 });
  }

  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward || reward.executed) {
    throw Object.assign(new Error("Pick a wishlist item"), { status: 400 });
  }

  const cost = reward.estimatedCost;
  if (cost > state.fund.treat) {
    throw Object.assign(
      new Error("Treat pool is below this item’s cost — Save more or pick a cheaper item"),
      { status: 400 },
    );
  }
  if (cost <= 0) {
    throw Object.assign(new Error("Item cost must be > 0"), { status: 400 });
  }

  return {
    ...state,
    fund: {
      ...state.fund,
      treat: round2(state.fund.treat - cost),
    },
    consecutiveSaves: 0,
    rewards: state.rewards.map((r) =>
      r.id === rewardId
        ? {
            ...r,
            executed: true,
            executedAt: new Date().toISOString(),
            actualCost: cost,
            notes: note || r.notes,
            assignedMilestoneDay: moment.dayNumber,
          }
        : r,
    ),
    milestoneDecisions: [
      ...state.milestoneDecisions,
      {
        id: newId("decision"),
        milestoneAchievementId,
        dayNumber: moment.dayNumber,
        choice: "treat",
        amount: cost,
        rewardId,
        note,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
