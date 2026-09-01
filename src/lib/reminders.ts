import { appBaseUrl } from "./env";
import { REMINDERS_ENABLED } from "./feature-flags";
import type { RebuildProfile, RebuildState, ReminderPrefs } from "./types";

export type ReminderKind = "morning" | "evening";

export type { ReminderPrefs };

export const DEFAULT_REMINDERS: ReminderPrefs = {
  enabled: false,
  morningEnabled: false,
  eveningEnabled: false,
  morningHour: 7,
  eveningHour: 20,
};

export function remindersGloballyEnabled(): boolean {
  return REMINDERS_ENABLED;
}

export function normalizeReminders(
  raw: Partial<ReminderPrefs> | RebuildProfile["reminders"] | undefined,
): ReminderPrefs {
  const morningHour = clampHour(
    raw?.morningHour ?? DEFAULT_REMINDERS.morningHour,
  );
  const eveningHour = clampHour(
    raw?.eveningHour ?? DEFAULT_REMINDERS.eveningHour,
  );
  const legacyOn = Boolean(raw?.enabled);
  const morningEnabled =
    raw && "morningEnabled" in raw
      ? Boolean(raw.morningEnabled)
      : legacyOn;
  const eveningEnabled =
    raw && "eveningEnabled" in raw
      ? Boolean(raw.eveningEnabled)
      : legacyOn;
  return {
    enabled: morningEnabled || eveningEnabled,
    morningEnabled,
    eveningEnabled,
    morningHour,
    eveningHour,
  };
}

function clampHour(n: number): number {
  if (!Number.isFinite(n)) return 7;
  return Math.max(0, Math.min(23, Math.round(n)));
}

/** Calendar date + hour in the profile timezone. */
export function localClock(
  timeZone: string,
  now = new Date(),
): { date: string; hour: number; minute: number } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    dtf
      .formatToParts(now)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export { appBaseUrl };

export function reminderLink(kind: ReminderKind): string {
  const base = appBaseUrl();
  return kind === "morning" ? `${base}/morning` : `${base}/evening`;
}

/**
 * GitHub Actions hourly cron often drifts past the exact target hour.
 * Catch up same local day after the chosen hour so a late tick still sends.
 * Morning stops once the evening window starts (or mid-afternoon if evening is off).
 */
export function dueReminderKinds(
  state: RebuildState,
  now = new Date(),
): ReminderKind[] {
  if (!remindersGloballyEnabled()) return [];
  const profile = state.profile;
  if (!profile?.email?.trim()) return [];
  const prefs = normalizeReminders(profile.reminders);
  const { date, hour } = localClock(profile.timezone, now);
  const log = state.reminderLog ?? {};
  const due: ReminderKind[] = [];

  const morningDeadline = prefs.eveningEnabled
    ? prefs.eveningHour
    : Math.min(23, prefs.morningHour + 6);

  if (
    prefs.morningEnabled &&
    log.morning !== date &&
    hour >= prefs.morningHour &&
    hour < morningDeadline
  ) {
    due.push("morning");
  }
  if (
    prefs.eveningEnabled &&
    log.evening !== date &&
    hour >= prefs.eveningHour
  ) {
    due.push("evening");
  }
  return due;
}

export function markReminderSent(
  state: RebuildState,
  kind: ReminderKind,
  date: string,
): RebuildState {
  return {
    ...state,
    reminderLog: {
      ...(state.reminderLog ?? {}),
      [kind]: date,
    },
  };
}
