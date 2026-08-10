import { MILESTONE_DEFS, type AlignmentStatus, type EveningCheckIn, type MilestoneDef, type RebuildState, type SupportCompletion, type SupportConfig, type SupportType } from "./types";

/** Local calendar date YYYY-MM-DD in a timezone */
export function todayInTz(timezone = "America/Los_Angeles"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: string, days: number): string {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(date: string): string {
  return parseDate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Sunday → Saturday week containing `date` */
export function weekBounds(date: string): { start: string; end: string } {
  const d = parseDate(date);
  const day = d.getDay(); // 0 Sun
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: formatDate(start), end: formatDate(end) };
}

export function datesInRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** Clean days this run = aligned evenings on/after currentRunStartedOn */
export function cleanDaysThisRun(state: RebuildState): number {
  if (!state.profile) return 0;
  const start = state.profile.currentRunStartedOn;
  return state.evenings.filter(
    (e) => e.date >= start && e.alignment === "aligned",
  ).length;
}

export function totalLifetimeCleanDays(state: RebuildState): number {
  return state.evenings.filter((e) => e.alignment === "aligned").length;
}

export function moneyReclaimed(state: RebuildState): number {
  return state.transfers.reduce((sum, t) => sum + t.amount, 0);
}

export function moneySetAside(state: RebuildState): number {
  return moneyReclaimed(state);
}

export function waitingReclaimDays(state: RebuildState) {
  return state.reclaimDays.filter((d) => !d.accounted);
}

export function waitingReclaimTotal(state: RebuildState): number {
  return waitingReclaimDays(state).reduce((s, d) => s + d.estimatedAmount, 0);
}

export function daysAccounted(state: RebuildState): {
  accounted: number;
  eligible: number;
} {
  const eligible = state.reclaimDays.length;
  const accounted = state.reclaimDays.filter((d) => d.accounted).length;
  return { accounted, eligible };
}

export function nextMilestones(
  cleanDays: number,
  count = 3,
): MilestoneDef[] {
  return MILESTONE_DEFS.filter((m) => m.dayNumber > cleanDays).slice(0, count);
}

export function milestoneAt(dayNumber: number): MilestoneDef | undefined {
  return MILESTONE_DEFS.find((m) => m.dayNumber === dayNumber);
}

/** Projected reclaim value if user stays clean to targetDay (this run) */
export function projectedReclaimAt(
  state: RebuildState,
  targetCleanDay: number,
): number {
  if (!state.profile) return 0;
  const current = cleanDaysThisRun(state);
  const daily = state.profile.historicalDailySpend;
  const already = moneyReclaimed(state);
  const waiting = waitingReclaimTotal(state);
  const daysToGo = Math.max(0, targetCleanDay - current);
  return already + waiting + daysToGo * daily;
}

/**
 * Reward scale grows with milestone day number.
 * Base = dailySpend * dayNumber * factor, floored.
 * Later milestones get incrementally larger suggested pools.
 */
export function suggestedRewardPool(dayNumber: number, dailySpend: number): number {
  const curve = 0.35 + Math.min(dayNumber, 365) / 365 * 0.45;
  return Math.round(dailySpend * dayNumber * curve);
}

export function weeklySupportProgress(
  state: RebuildState,
  date: string,
): { type: SupportType; label: string; target: number; done: number }[] {
  if (!state.profile) return [];
  const { start, end } = weekBounds(date);
  return state.profile.supports
    .filter((s) => s.enabled)
    .map((s) => {
      const done = state.supports.filter(
        (c) =>
          c.supportType === s.type &&
          c.completed &&
          c.date >= start &&
          c.date <= end,
      ).length;
      return {
        type: s.type,
        label: s.label,
        target: s.weeklyTarget,
        done: Math.min(done, s.weeklyTarget),
      };
    });
}

export function weekFullyComplete(
  state: RebuildState,
  date: string,
): boolean {
  const progress = weeklySupportProgress(state, date);
  if (progress.length === 0) return false;
  return progress.every((p) => p.done >= p.target);
}

export function getEvening(state: RebuildState, date: string) {
  return state.evenings.find((e) => e.date === date);
}

export function getMorning(state: RebuildState, date: string) {
  return state.mornings.find((m) => m.date === date);
}

export function supportsForDate(state: RebuildState, date: string) {
  return state.supports.filter((s) => s.date === date && s.completed);
}

export function isSupportDoneToday(
  state: RebuildState,
  date: string,
  type: SupportType,
): boolean {
  return state.supports.some(
    (s) => s.date === date && s.supportType === type && s.completed,
  );
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function emptyState(): RebuildState {
  return {
    profile: null,
    mornings: [],
    evenings: [],
    supports: [],
    reclaimDays: [],
    transfers: [],
    rewards: [],
    milestones: [],
    returns: [],
    cravings: [],
    weeklyBonuses: [],
    journals: [],
    fund: { future: 0, rebuild: 0, treat: 0 },
    consecutiveSaves: 0,
    milestoneDecisions: [],
  };
}

export function assignedRewardForMilestone(
  state: RebuildState,
  dayNumber: number,
) {
  return state.rewards.find(
    (r) => r.assignedMilestoneDay === dayNumber && !r.executed,
  );
}

export function moneyReinvested(state: RebuildState): number {
  return state.rewards
    .filter((r) => r.executed)
    .reduce((s, r) => s + (r.actualCost ?? r.estimatedCost), 0);
}

export type DashboardSnapshot = {
  cleanDays: number;
  label: string;
  reclaimed: number;
  waiting: number;
  waitingDays: number;
  accounted: number;
  eligible: number;
  next: MilestoneDef[];
  week: ReturnType<typeof weeklySupportProgress>;
  todayMorning?: ReturnType<typeof getMorning>;
  todayEvening?: ReturnType<typeof getEvening>;
  todaySupports: SupportCompletion[];
};

export function buildDashboard(
  state: RebuildState,
  today: string,
): DashboardSnapshot | null {
  if (!state.profile) return null;
  const cleanDays = cleanDaysThisRun(state);
  const { accounted, eligible } = daysAccounted(state);
  const waiting = waitingReclaimDays(state);
  return {
    cleanDays,
    label: `ReBuilding for ${cleanDays} day${cleanDays === 1 ? "" : "s"}`,
    reclaimed: moneyReclaimed(state),
    waiting: waitingReclaimTotal(state),
    waitingDays: waiting.length,
    accounted,
    eligible,
    next: nextMilestones(cleanDays, 3),
    week: weeklySupportProgress(state, today),
    todayMorning: getMorning(state, today),
    todayEvening: getEvening(state, today),
    todaySupports: supportsForDate(state, today),
  };
}

export function alignmentLabel(a: AlignmentStatus): string {
  switch (a) {
    case "aligned":
      return "Yes — stayed aligned";
    case "return_to_use":
      return "Return to use";
    case "other":
      return "Something else happened";
  }
}

export function supportLabel(
  supports: SupportConfig[],
  type: SupportType,
): string {
  return supports.find((s) => s.type === type)?.label ?? type;
}
