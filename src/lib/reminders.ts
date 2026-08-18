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

export function normalizeReminders(
  raw: RebuildProfile["reminders"] | undefined,
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

export function appBaseUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  return process.env.REBUILD_ENV === "prod"
    ? "https://rebuild-prod.fly.dev"
    : "https://rebuild-dev.fly.dev";
}

export function reminderLink(kind: ReminderKind): string {
  const base = appBaseUrl();
  return kind === "morning" ? `${base}/morning` : `${base}/evening`;
}

export function dueReminderKinds(
  state: RebuildState,
  now = new Date(),
): ReminderKind[] {
  const profile = state.profile;
  if (!profile?.email?.trim()) return [];
  const prefs = normalizeReminders(profile.reminders);
  const { date, hour } = localClock(profile.timezone, now);
  const log = state.reminderLog ?? {};
  const due: ReminderKind[] = [];

  if (
    prefs.morningEnabled &&
    hour === prefs.morningHour &&
    log.morning !== date
  ) {
    due.push("morning");
  }
  if (
    prefs.eveningEnabled &&
    hour === prefs.eveningHour &&
    log.evening !== date
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
