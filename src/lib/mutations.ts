import {
  calendarDaysBetween,
  cleanDaysThisRun,
  milestoneAt,
  newId,
  todayInTz,
  weekBounds,
  weekFullyComplete,
} from "./journey";
import { applySplitToFund, splitTransfer } from "./fund";
import type {
  EveningCheckIn,
  MilestoneAchievement,
  RebuildState,
  ReturnEvent,
} from "./types";
import { MILESTONE_DEFS } from "./types";

const WEEKLY_BONUS_AMOUNT = 20;

/**
 * After an evening check-in is saved, apply journey side effects:
 * - aligned → create reclaim day if missing; award newly crossed milestones
 * - return_to_use → record return, reset run counter (history kept)
 * - check weekly 100% bonus eligibility
 */
export function applyEveningSideEffects(
  state: RebuildState,
  evening: EveningCheckIn,
): RebuildState {
  if (!state.profile) return state;
  let next: RebuildState = {
    ...state,
    evenings: [
      ...state.evenings.filter((e) => e.date !== evening.date),
      evening,
    ],
  };

  if (evening.alignment === "aligned") {
    next = ensureReclaimDay(next, evening.date);
    next = awardCrossedMilestones(next, evening.date);
  }

  if (evening.alignment === "return_to_use") {
    next = handleReturnToUse(next, evening);
  }

  next = maybeCreateWeeklyBonus(next, evening.date);
  return next;
}

function ensureReclaimDay(state: RebuildState, date: string): RebuildState {
  if (!state.profile) return state;
  if (state.reclaimDays.some((d) => d.date === date)) return state;
  return {
    ...state,
    reclaimDays: [
      ...state.reclaimDays,
      {
        date,
        estimatedAmount: state.profile.historicalDailySpend,
        accounted: false,
      },
    ],
  };
}

function handleReturnToUse(
  state: RebuildState,
  evening: EveningCheckIn,
): RebuildState {
  if (!state.profile) return state;
  const start = state.profile.currentRunStartedOn;
  // Abstinence days completed before the return day (return day does not count).
  const previousClean =
    evening.date > start ? calendarDaysBetween(start, evening.date) : 0;

  const endedRunId = state.profile.currentRunId;
  const returnEvent: ReturnEvent = {
    id: newId("return"),
    date: evening.date,
    notes: evening.returnNotes,
    previousCleanDays: previousClean,
    runIdEnded: endedRunId,
    createdAt: new Date().toISOString(),
  };

  const [y, m, d] = evening.date.split("-").map(Number);
  const nextDay = new Date(y, m - 1, d + 1);
  const yyyy = nextDay.getFullYear();
  const mm = String(nextDay.getMonth() + 1).padStart(2, "0");
  const dd = String(nextDay.getDate()).padStart(2, "0");
  const newStart = `${yyyy}-${mm}-${dd}`;

  return {
    ...state,
    returns: [...state.returns, returnEvent],
    profile: {
      ...state.profile,
      currentRunId: newId("run"),
      currentRunStartedOn: newStart,
    },
  };
}

function awardCrossedMilestones(
  state: RebuildState,
  asOfDate: string,
): RebuildState {
  if (!state.profile) return state;
  const clean = cleanDaysThisRun(state, asOfDate);
  const runId = state.profile.currentRunId;
  const alreadyThisRun = new Set(
    state.milestones
      .filter((m) => m.runId === runId)
      .map((m) => m.dayNumber),
  );

  const newly: MilestoneAchievement[] = [];
  for (const def of MILESTONE_DEFS) {
    if (def.dayNumber > clean) break;
    if (alreadyThisRun.has(def.dayNumber)) continue;
    newly.push({
      id: newId("ms"),
      dayNumber: def.dayNumber,
      title: def.title,
      type: def.type,
      runId,
      cleanDaysAtAchieve: clean,
      achievedAt: new Date().toISOString(),
      rewardEligible: def.type === "reward" || def.type === "destination",
    });
  }

  if (newly.length === 0) return state;
  return { ...state, milestones: [...state.milestones, ...newly] };
}

export function maybeCreateWeeklyBonus(
  state: RebuildState,
  date: string,
): RebuildState {
  if (!weekFullyComplete(state, date)) return state;
  const { start } = weekBounds(date);
  if (state.weeklyBonuses.some((b) => b.weekStart === start)) return state;
  return {
    ...state,
    weeklyBonuses: [
      ...state.weeklyBonuses,
      {
        id: newId("bonus"),
        weekStart: start,
        amount: WEEKLY_BONUS_AMOUNT,
        confirmed: false,
      },
    ],
  };
}

export function confirmTransfer(
  state: RebuildState,
  dayDates: string[],
  actualAmount: number,
  note?: string,
): RebuildState {
  const id = newId("xfer");
  const today = state.profile
    ? todayInTz(state.profile.timezone)
    : todayInTz();
  const split = splitTransfer(actualAmount);
  const transfers = [
    ...state.transfers,
    {
      id,
      amount: actualAmount,
      date: today,
      dayDates,
      userConfirmed: true,
      note,
      createdAt: new Date().toISOString(),
      split,
    },
  ];

  const reclaimDays = state.reclaimDays.map((d) => {
    if (!dayDates.includes(d.date)) return d;
    const share =
      dayDates.length === 0
        ? 0
        : Math.round((actualAmount / dayDates.length) * 100) / 100;
    return {
      ...d,
      accounted: true,
      reclaimedAmount: share,
      confirmedAt: new Date().toISOString(),
      transferId: id,
    };
  });

  return {
    ...state,
    transfers,
    reclaimDays,
    fund: applySplitToFund(state.fund, split),
  };
}

export function confirmWeeklyBonus(
  state: RebuildState,
  bonusId: string,
): RebuildState {
  return {
    ...state,
    weeklyBonuses: state.weeklyBonuses.map((b) =>
      b.id === bonusId
        ? { ...b, confirmed: true, confirmedAt: new Date().toISOString() }
        : b,
    ),
  };
}

export { milestoneAt, WEEKLY_BONUS_AMOUNT };
