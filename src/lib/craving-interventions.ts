import type { RebuildProfile } from "./types";

export const INTERVENTION_LABEL_MAX = 32;

export const DEFAULT_CRAVING_INTERVENTIONS = [
  "Walk",
  "Shower",
  "Eat",
  "Exercise",
  "Leave environment",
  "Contact someone",
  "Journal",
  "Breathing",
  "Other",
] as const;

function normKey(label: string): string {
  return label.trim().toLowerCase();
}

/** Default + user-added craving interventions (deduped, defaults first). */
export function cravingInterventionOptions(
  profile: Pick<RebuildProfile, "cravingInterventions"> | null | undefined,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of DEFAULT_CRAVING_INTERVENTIONS) {
    const key = normKey(label);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  for (const raw of profile?.cravingInterventions ?? []) {
    const label = raw.trim().slice(0, INTERVENTION_LABEL_MAX);
    if (!label) continue;
    const key = normKey(label);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

export function formatCravingOutcomes(c: {
  outcomes?: string[];
  outcome?: string;
  intervention?: string;
}): string {
  if (c.outcomes?.length) return c.outcomes.join(", ");
  const outcome = String(c.outcome ?? "").trim();
  if (outcome && outcome.toLowerCase() !== "delay") return outcome;
  const intervention = String(c.intervention ?? "").trim();
  if (intervention && intervention.toLowerCase() !== "delay") return intervention;
  return "";
}
