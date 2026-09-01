import { describe, expect, it } from "vitest";
import { REMINDERS_ENABLED, SETTINGS_DAILY_SPEND_ENABLED } from "./feature-flags";
import { remindersGloballyEnabled } from "./reminders";

describe("feature flags", () => {
  it("keeps daily email reminders off by default", () => {
    expect(REMINDERS_ENABLED).toBe(false);
    expect(remindersGloballyEnabled()).toBe(false);
  });

  it("keeps daily spend hidden in settings by default", () => {
    expect(SETTINGS_DAILY_SPEND_ENABLED).toBe(false);
  });
});
