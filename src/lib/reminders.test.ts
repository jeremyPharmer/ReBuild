import { describe, expect, it } from "vitest";
import {
  dueReminderKinds,
  localClock,
  markReminderSent,
  normalizeReminders,
} from "./reminders";
import { emptyState } from "./journey";
import { DEFAULT_SUPPORTS } from "./types";

describe("reminders", () => {
  it("normalizes hours into 0–23", () => {
    expect(normalizeReminders({ enabled: true, morningHour: -1, eveningHour: 99 })).toEqual({
      enabled: true,
      morningEnabled: true,
      eveningEnabled: true,
      morningHour: 0,
      eveningHour: 23,
    });
  });

  it("reports a local clock for a timezone", () => {
    const clock = localClock("UTC", new Date("2026-08-11T14:30:00.000Z"));
    expect(clock.date).toBe("2026-08-11");
    expect(clock.hour).toBe(14);
    expect(clock.minute).toBe(30);
  });

  it("only dues matching hour when enabled and not already sent", () => {
    const state = emptyState();
    state.profile = {
      id: "u",
      createdAt: "",
      onboarded: true,
      displayName: "J",
      historicalDailySpend: 10,
      startDate: "2026-08-10",
      currentRunId: "run_1",
      currentRunStartedOn: "2026-08-10",
      supports: DEFAULT_SUPPORTS,
      timezone: "UTC",
      email: "j@example.com",
      reminders: normalizeReminders({
        enabled: true,
        morningHour: 7,
        eveningHour: 20,
      }),
    };

    const morning = dueReminderKinds(state, new Date("2026-08-11T07:05:00.000Z"));
    expect(morning).toEqual(["morning"]);

    const after = markReminderSent(state, "morning", "2026-08-11");
    expect(dueReminderKinds(after, new Date("2026-08-11T07:05:00.000Z"))).toEqual([]);

    const evening = dueReminderKinds(after, new Date("2026-08-11T20:01:00.000Z"));
    expect(evening).toEqual(["evening"]);
  });

  it("can enable close without start", () => {
    const state = emptyState();
    state.profile = {
      id: "u",
      createdAt: "",
      onboarded: true,
      displayName: "J",
      historicalDailySpend: 10,
      startDate: "2026-08-10",
      currentRunId: "run_1",
      currentRunStartedOn: "2026-08-10",
      supports: DEFAULT_SUPPORTS,
      timezone: "UTC",
      email: "j@example.com",
      reminders: {
        enabled: true,
        morningEnabled: false,
        eveningEnabled: true,
        morningHour: 7,
        eveningHour: 20,
      },
    };
    expect(dueReminderKinds(state, new Date("2026-08-11T07:05:00.000Z"))).toEqual(
      [],
    );
    expect(
      dueReminderKinds(state, new Date("2026-08-11T20:01:00.000Z")),
    ).toEqual(["evening"]);
  });

  it("catches up evening after the target hour same day", () => {
    const state = emptyState();
    state.profile = {
      id: "u",
      createdAt: "",
      onboarded: true,
      displayName: "J",
      historicalDailySpend: 10,
      startDate: "2026-08-10",
      currentRunId: "run_1",
      currentRunStartedOn: "2026-08-10",
      supports: DEFAULT_SUPPORTS,
      timezone: "UTC",
      email: "j@example.com",
      reminders: normalizeReminders({
        morningEnabled: true,
        eveningEnabled: true,
        morningHour: 7,
        eveningHour: 20,
      }),
    };

    // Cron drifted to 23:13 local — still send evening, not morning again
    expect(
      dueReminderKinds(state, new Date("2026-08-11T23:13:00.000Z")),
    ).toEqual(["evening"]);

    // Before evening hour, only morning catch-up
    expect(
      dueReminderKinds(state, new Date("2026-08-11T09:30:00.000Z")),
    ).toEqual(["morning"]);
  });
});
