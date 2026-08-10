// Core domain logic for ReBuild's recovery-incentive system.
// These functions are pure so they can be unit-tested in isolation from
// the persistence layer and the Next.js request lifecycle.

export type Reward = {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
};

export type Redemption = {
  rewardId: string;
  name: string;
  cost: number;
  at: string;
};

export type User = {
  id: string;
  name: string;
  goal: string;
  createdAt: string;
  points: number;
  streak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  checkIns: string[];
  redemptions: Redemption[];
};

export const POINTS_PER_CHECKIN = 10;

// Bonus points awarded when a user reaches a streak milestone.
export const MILESTONE_BONUSES: Record<number, number> = {
  3: 20,
  7: 50,
  14: 100,
  30: 200,
};

export const REWARDS: Reward[] = [
  {
    id: "coffee",
    name: "Coffee voucher",
    description: "A warm drink on us to celebrate showing up.",
    cost: 50,
    emoji: "☕",
  },
  {
    id: "journal",
    name: "Recovery journal",
    description: "A guided journal to reflect on your progress.",
    cost: 100,
    emoji: "📓",
  },
  {
    id: "movie",
    name: "Movie ticket",
    description: "Treat yourself to a night out.",
    cost: 150,
    emoji: "🎬",
  },
  {
    id: "donation",
    name: "Charity donation",
    description: "We donate to a recovery charity in your name.",
    cost: 300,
    emoji: "💜",
  },
];

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function previousDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return toDateString(d);
}

export type CheckInResult = {
  user: User;
  awarded: number;
  bonus: number;
  milestone: number | null;
};

export class DomainError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "DomainError";
  }
}

export function applyCheckIn(user: User, today: string): CheckInResult {
  if (user.lastCheckIn === today) {
    throw new DomainError("ALREADY_CHECKED_IN");
  }

  const continuesStreak = user.lastCheckIn !== null && previousDay(today) === user.lastCheckIn;
  const streak = continuesStreak ? user.streak + 1 : 1;

  const bonus = MILESTONE_BONUSES[streak] ?? 0;
  const awarded = POINTS_PER_CHECKIN + bonus;

  const updated: User = {
    ...user,
    streak,
    longestStreak: Math.max(user.longestStreak, streak),
    points: user.points + awarded,
    lastCheckIn: today,
    checkIns: [...user.checkIns, today],
  };

  return { user: updated, awarded, bonus, milestone: bonus > 0 ? streak : null };
}

export function redeemReward(user: User, rewardId: string, at: string): User {
  const reward = REWARDS.find((r) => r.id === rewardId);
  if (!reward) {
    throw new DomainError("UNKNOWN_REWARD");
  }
  if (user.points < reward.cost) {
    throw new DomainError("INSUFFICIENT_POINTS");
  }

  return {
    ...user,
    points: user.points - reward.cost,
    redemptions: [
      ...user.redemptions,
      { rewardId, name: reward.name, cost: reward.cost, at },
    ],
  };
}
