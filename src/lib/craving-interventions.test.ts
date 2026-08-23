import { describe, expect, it } from "vitest";
import {
  cravingInterventionOptions,
  DEFAULT_CRAVING_INTERVENTIONS,
} from "./craving-interventions";
import { cravingPlaybook } from "./trends";
import { DEFAULT_SUPPORTS, type RebuildState } from "./types";
import { emptyState } from "./journey";

function baseState(): RebuildState {
  const state = emptyState();
  state.profile = {
    id: "user_1",
    createdAt: new Date().toISOString(),
    onboarded: true,
    displayName: "Founder",
    historicalDailySpend: 40,
    startDate: "2026-08-01",
    currentRunId: "run_1",
    currentRunStartedOn: "2026-08-01",
    supports: DEFAULT_SUPPORTS,
    timezone: "America/Los_Angeles",
    cravingInterventions: ["Call sponsor"],
  };
  return state;
}

describe("cravingInterventionOptions", () => {
  it("merges defaults with custom labels without duplicates", () => {
    const opts = cravingInterventionOptions({
      cravingInterventions: ["Call sponsor", "Walk"],
    });
    expect(opts[0]).toBe(DEFAULT_CRAVING_INTERVENTIONS[0]);
    expect(opts).toContain("Call sponsor");
    expect(opts.filter((o) => o.toLowerCase() === "walk")).toHaveLength(1);
  });
});

describe("cravingPlaybook multi-outcome", () => {
  it("credits each selected intervention from one craving event", () => {
    const state = baseState();
    state.cravings = [
      {
        id: "c1",
        at: "2026-08-10T18:00:00.000Z",
        intensityBefore: 8,
        intensityAfter: 3,
        situation: "alone",
        intervention: "intervention",
        outcomes: ["Walk", "Breathing"],
      },
      {
        id: "c2",
        at: "2026-08-11T18:00:00.000Z",
        intensityBefore: 7,
        intensityAfter: 2,
        situation: "stress",
        intervention: "intervention",
        outcomes: ["Walk"],
      },
      {
        id: "c3",
        at: "2026-08-12T18:00:00.000Z",
        intensityBefore: 6,
        intensityAfter: 1,
        situation: "late",
        intervention: "intervention",
        outcomes: ["Breathing"],
      },
    ];
    const rows = cravingPlaybook(state, "2026-08-12", 1);
    const walk = rows.find((r) => r.outcome === "Walk");
    const breathing = rows.find((r) => r.outcome === "Breathing");
    expect(walk?.n).toBe(2);
    expect(breathing?.n).toBe(2);
  });
});
