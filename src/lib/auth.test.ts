import { describe, expect, it } from "vitest";
import {
  isAdminEmail,
  GENDER_OPTIONS,
  US_STATES,
  validatePin,
} from "./auth-constants";
import { normalizeDb } from "./db";
import { emptyState } from "./journey";

describe("auth helpers", () => {
  it("validates 4-digit pins only", () => {
    expect(validatePin("1234")).toBe(true);
    expect(validatePin("12")).toBe(false);
    expect(validatePin("abcd")).toBe(false);
  });

  it("recognizes admin allowlist", () => {
    expect(isAdminEmail("jeremyrschrader@gmail.com")).toBe(true);
    expect(isAdminEmail("other@example.com")).toBe(false);
  });

  it("has fixed gender and US state sets", () => {
    expect(GENDER_OPTIONS.length).toBe(4);
    expect(US_STATES.some((s) => s.code === "CA")).toBe(true);
    expect(US_STATES.some((s) => s.code === "DC")).toBe(true);
  });

  it("migrates legacy single-tenant db into legacyState", () => {
    const legacy = emptyState();
    legacy.profile = {
      id: "user_old",
      createdAt: "2026-01-01T00:00:00.000Z",
      onboarded: true,
      displayName: "Founder",
      historicalDailySpend: 40,
      startDate: "2026-01-01",
      currentRunId: "run_1",
      currentRunStartedOn: "2026-01-01",
      supports: [],
      timezone: "America/Los_Angeles",
    };
    const db = normalizeDb(legacy);
    expect(db.version).toBe(2);
    expect(db.users).toHaveLength(0);
    expect(db.legacyState?.profile?.displayName).toBe("Founder");
  });
});
