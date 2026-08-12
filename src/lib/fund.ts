import { newId, cleanDaysThisRun, waitingReclaimTotal } from "./journey";
import type {
  FundLedger,
  MilestoneAchievement,
  RebuildState,
  Reward,
} from "./types";

export function emptyFund(): FundLedger {
  return { future: 0, treat: 0 };
}

export function fundTotal(fund: FundLedger): number {
  return round2((fund.future ?? 0) + (fund.treat ?? 0) + (fund.rebuild ?? 0));
}

/** Fold legacy Rebuild bucket into Future; two-bucket model only. */
export function normalizeFund(fund: FundLedger | undefined): FundLedger {
  const raw = fund ?? emptyFund();
  const legacyRebuild = raw.rebuild ?? 0;
  return {
    future: round2((raw.future ?? 0) + legacyRebuild),
    treat: round2(raw.treat ?? 0),
  };
}

export function normalizeState(state: RebuildState): RebuildState {
  return {
    ...state,
    skips: state.skips ?? [],
    fund: normalizeFund(state.fund),
    consecutiveSaves: state.consecutiveSaves ?? 0,
    milestoneDecisions: state.milestoneDecisions ?? [],
    listenedPodcasts: state.listenedPodcasts ?? [],
    reminderLog: state.reminderLog ?? {},
  };
}

/** Locked split: Future 30% / Treat Yourself 70%. */
export const FUTURE_SPLIT = 0.3;
export const TREAT_SPLIT = 0.7;

export function splitTransfer(amount: number): FundLedger {
  const future = round2(amount * FUTURE_SPLIT);
  const treat = round2(amount - future);
  return { future, treat };
}

export function applySplitToFund(
  fund: FundLedger,
  split: FundLedger,
): FundLedger {
  const base = normalizeFund(fund);
  return {
    future: round2(base.future + (split.future ?? 0)),
    treat: round2(base.treat + (split.treat ?? 0)),
  };
}

/**
 * Debit Treat first, then Future for any remaining cost.
 * `futurePull` opts in to and caps how much Future may cover.
 */
export function spendFromTreatAndFuture(
  fund: FundLedger,
  cost: number,
  futurePull?: number,
): FundLedger {
  const base = normalizeFund(fund);
  if (!Number.isFinite(cost) || cost <= 0) {
    throw Object.assign(new Error("Item cost must be > 0"), { status: 400 });
  }
  if (
    futurePull !== undefined &&
    (!Number.isFinite(futurePull) || futurePull < 0)
  ) {
    throw Object.assign(new Error("Future pull must be a non-negative amount"), {
      status: 400,
    });
  }

  const fromTreat = Math.min(base.treat, cost);
  const deficit = round2(cost - fromTreat);
  const maxPull = futurePull === undefined ? 0 : round2(futurePull);
  const fromFuture = Math.min(base.future, deficit, maxPull);

  if (round2(fromTreat + fromFuture) < cost) {
    throw Object.assign(
      new Error(
        "Not enough in Treat Yourself + Future pull for this item — pick a cheaper treat or pull more from Future",
      ),
      { status: 400 },
    );
  }

  return {
    future: round2(base.future - fromFuture),
    treat: round2(base.treat - fromTreat),
  };
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

/**
 * Treat Yourself available by a future incentive day:
 * current Treat Yourself balance + 70% of (waiting reclaim + days-to-go × daily).
 */
export function projectedTreatYourselfAt(
  state: RebuildState,
  targetCleanDay: number,
  asOfDate?: string,
): number {
  if (!state.profile) return 0;
  const current = cleanDaysThisRun(state, asOfDate);
  const daily = state.profile.historicalDailySpend;
  const waiting = waitingReclaimTotal(state);
  const daysToGo = Math.max(0, targetCleanDay - current);
  const treatNow = normalizeFund(state.fund).treat;
  const futureTreat = (waiting + daysToGo * daily) * TREAT_SPLIT;
  return round2(treatNow + futureTreat);
}

/** Affordable if Treat + Future can cover (optional Future pull). */
export function eligibleWishlist(state: RebuildState): Reward[] {
  const fund = normalizeFund(state.fund);
  const ceiling = round2(fund.treat + fund.future);
  return state.rewards.filter((r) => !r.executed && r.estimatedCost <= ceiling);
}

/**
 * Save for the Future — skip spending short-term Treat this reward moment.
 * Does not move money into Treat (old Save & compound direction retired).
 * `note` is required: how you rewarded yourself (can be free / non-spend).
 */
export function saveForFuture(
  state: RebuildState,
  milestoneAchievementId: string,
  note?: string,
  photoId?: string,
): RebuildState {
  const moment = state.milestones.find((m) => m.id === milestoneAchievementId);
  if (!moment || !moment.rewardEligible) {
    throw Object.assign(new Error("Milestone not cashable"), { status: 400 });
  }
  if (
    state.milestoneDecisions.some(
      (d) => d.milestoneAchievementId === milestoneAchievementId,
    )
  ) {
    throw Object.assign(new Error("Already decided"), { status: 409 });
  }
  if (mustTreat(state)) {
    throw Object.assign(
      new Error("Treat Yourself required — Save for the Future not allowed"),
      { status: 400 },
    );
  }
  const trimmed = String(note ?? "").trim();
  if (!trimmed) {
    throw Object.assign(
      new Error("Tell us how you are rewarding yourself today"),
      { status: 400 },
    );
  }

  return {
    ...state,
    fund: normalizeFund(state.fund),
    consecutiveSaves: (state.consecutiveSaves ?? 0) + 1,
    milestoneDecisions: [
      ...state.milestoneDecisions,
      {
        id: newId("decision"),
        milestoneAchievementId,
        dayNumber: moment.dayNumber,
        choice: "save",
        amount: 0,
        note: trimmed,
        photoId,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

/** @deprecated use saveForFuture — kept for API alias during ship */
export function saveCompound(
  state: RebuildState,
  milestoneAchievementId: string,
  _amount?: number,
  note?: string,
  photoId?: string,
): RebuildState {
  return saveForFuture(state, milestoneAchievementId, note, photoId);
}

/**
 * Spend a wishlist item (Treat first, optional Future pull).
 */
export function executeWishlist(
  state: RebuildState,
  rewardId: string,
  actualCost?: number,
  notes?: string,
  futurePull?: number,
): RebuildState {
  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward || reward.executed) {
    throw Object.assign(new Error("Wishlist item not available"), {
      status: 400,
    });
  }

  const cost =
    actualCost !== undefined && Number.isFinite(actualCost)
      ? actualCost
      : reward.estimatedCost;

  const fund = spendFromTreatAndFuture(state.fund, cost, futurePull);

  return {
    ...state,
    fund,
    consecutiveSaves: 0,
    rewards: state.rewards.map((r) =>
      r.id === rewardId
        ? {
            ...r,
            executed: true,
            executedAt: new Date().toISOString(),
            actualCost: cost,
            notes: notes || r.notes,
          }
        : r,
    ),
  };
}

export function treatYourself(
  state: RebuildState,
  milestoneAchievementId: string,
  rewardId: string,
  note?: string,
  futurePull?: number,
  photoId?: string,
  actualCost?: number,
): RebuildState {
  const moment = state.milestones.find((m) => m.id === milestoneAchievementId);
  if (!moment || !moment.rewardEligible) {
    throw Object.assign(new Error("Milestone not cashable"), { status: 400 });
  }
  if (
    state.milestoneDecisions.some(
      (d) => d.milestoneAchievementId === milestoneAchievementId,
    )
  ) {
    throw Object.assign(new Error("Already decided"), { status: 409 });
  }

  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward || reward.executed) {
    throw Object.assign(new Error("Pick a wishlist item"), { status: 400 });
  }

  const cost =
    actualCost !== undefined && Number.isFinite(actualCost)
      ? actualCost
      : reward.estimatedCost;
  if (!Number.isFinite(cost) || cost <= 0) {
    throw Object.assign(new Error("Enter how much you spent"), { status: 400 });
  }
  const fund = spendFromTreatAndFuture(state.fund, cost, futurePull);

  return {
    ...state,
    fund,
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
            photoId: photoId || r.photoId,
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
        photoId,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Claim without a pre-assigned wishlist item: name + optional note/photo.
 * No fund debit — celebration record only.
 */
export function claimCelebration(
  state: RebuildState,
  milestoneAchievementId: string,
  name: string,
  note?: string,
  photoId?: string,
): RebuildState {
  const moment = state.milestones.find((m) => m.id === milestoneAchievementId);
  if (!moment || !moment.rewardEligible) {
    throw Object.assign(new Error("Milestone not cashable"), { status: 400 });
  }
  if (
    state.milestoneDecisions.some(
      (d) => d.milestoneAchievementId === milestoneAchievementId,
    )
  ) {
    throw Object.assign(new Error("Already decided"), { status: 409 });
  }
  const trimmed = name.trim();
  if (!trimmed) {
    throw Object.assign(new Error("Tell us how you treated yourself"), {
      status: 400,
    });
  }

  const rewardId = newId("reward");
  const reward: Reward = {
    id: rewardId,
    name: trimmed,
    category: "other",
    estimatedCost: 0,
    actualCost: 0,
    assignedMilestoneDay: moment.dayNumber,
    executed: true,
    executedAt: new Date().toISOString(),
    notes: note,
    photoId,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    fund: normalizeFund(state.fund),
    consecutiveSaves: 0,
    rewards: [...state.rewards, reward],
    milestoneDecisions: [
      ...state.milestoneDecisions,
      {
        id: newId("decision"),
        milestoneAchievementId,
        dayNumber: moment.dayNumber,
        choice: "treat",
        amount: 0,
        rewardId,
        note,
        photoId,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
