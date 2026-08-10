import { describe, it, expect } from "vitest";
import {
  applyCheckIn,
  DomainError,
  MILESTONE_BONUSES,
  POINTS_PER_CHECKIN,
  previousDay,
  redeemReward,
  type User,
} from "./incentives";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Alex",
    goal: "Sobriety",
    createdAt: "2026-01-01T00:00:00.000Z",
    points: 0,
    streak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    checkIns: [],
    redemptions: [],
    ...overrides,
  };
}

describe("previousDay", () => {
  it("returns the day before, handling month boundaries", () => {
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });
});

describe("applyCheckIn", () => {
  it("awards base points and starts a streak on first check-in", () => {
    const result = applyCheckIn(makeUser(), "2026-02-10");
    expect(result.awarded).toBe(POINTS_PER_CHECKIN);
    expect(result.user.streak).toBe(1);
    expect(result.user.longestStreak).toBe(1);
    expect(result.user.points).toBe(POINTS_PER_CHECKIN);
    expect(result.user.lastCheckIn).toBe("2026-02-10");
  });

  it("continues the streak when checking in on consecutive days", () => {
    const user = makeUser({ streak: 1, longestStreak: 1, points: 10, lastCheckIn: "2026-02-10" });
    const result = applyCheckIn(user, "2026-02-11");
    expect(result.user.streak).toBe(2);
    expect(result.user.points).toBe(20);
  });

  it("resets the streak when a day is missed", () => {
    const user = makeUser({ streak: 5, longestStreak: 5, points: 100, lastCheckIn: "2026-02-10" });
    const result = applyCheckIn(user, "2026-02-13");
    expect(result.user.streak).toBe(1);
    expect(result.user.longestStreak).toBe(5);
  });

  it("awards a milestone bonus at a milestone streak", () => {
    const user = makeUser({ streak: 2, longestStreak: 2, points: 20, lastCheckIn: "2026-02-10" });
    const result = applyCheckIn(user, "2026-02-11");
    expect(result.milestone).toBe(3);
    expect(result.bonus).toBe(MILESTONE_BONUSES[3]);
    expect(result.awarded).toBe(POINTS_PER_CHECKIN + MILESTONE_BONUSES[3]);
  });

  it("rejects a second check-in on the same day", () => {
    const user = makeUser({ streak: 1, lastCheckIn: "2026-02-10", points: 10 });
    expect(() => applyCheckIn(user, "2026-02-10")).toThrow(DomainError);
  });
});

describe("redeemReward", () => {
  it("deducts points and records the redemption", () => {
    const user = makeUser({ points: 100 });
    const updated = redeemReward(user, "coffee", "2026-02-10");
    expect(updated.points).toBe(50);
    expect(updated.redemptions).toHaveLength(1);
    expect(updated.redemptions[0].name).toBe("Coffee voucher");
  });

  it("throws when the user cannot afford the reward", () => {
    const user = makeUser({ points: 10 });
    expect(() => redeemReward(user, "coffee", "2026-02-10")).toThrow(DomainError);
  });

  it("throws for an unknown reward", () => {
    const user = makeUser({ points: 1000 });
    expect(() => redeemReward(user, "nope", "2026-02-10")).toThrow(DomainError);
  });
});
