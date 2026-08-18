import { NextResponse } from "next/server";
import { normalizeReminders } from "@/lib/reminders";
import { updateState } from "@/lib/store";
import { DEFAULT_SUPPORTS, type SupportConfig } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const supports: SupportConfig[] = Array.isArray(body.supports)
        ? body.supports
        : prev.profile.supports ?? DEFAULT_SUPPORTS;
      const historicalDailySpend =
        body.historicalDailySpend !== undefined
          ? Number(body.historicalDailySpend)
          : prev.profile.historicalDailySpend;

      const email =
        body.email !== undefined
          ? String(body.email || "").trim() || undefined
          : prev.profile.email;

      const reminders =
        body.reminders !== undefined
          ? normalizeReminders({
              enabled: Boolean(
                body.reminders.morningEnabled ??
                  body.reminders.eveningEnabled ??
                  body.reminders.enabled,
              ),
              morningEnabled:
                body.reminders.morningEnabled !== undefined
                  ? Boolean(body.reminders.morningEnabled)
                  : Boolean(body.reminders.enabled),
              eveningEnabled:
                body.reminders.eveningEnabled !== undefined
                  ? Boolean(body.reminders.eveningEnabled)
                  : Boolean(body.reminders.enabled),
              morningHour: Number(body.reminders.morningHour),
              eveningHour: Number(body.reminders.eveningHour),
            })
          : prev.profile.reminders
            ? normalizeReminders(prev.profile.reminders)
            : undefined;

      if (reminders?.enabled && !email) {
        const err = new Error("Add an email before enabling reminders");
        (err as Error & { status: number }).status = 400;
        throw err;
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          supports,
          historicalDailySpend,
          displayName: body.displayName
            ? String(body.displayName)
            : prev.profile.displayName,
          email,
          reminders,
        },
      };
    });
    return NextResponse.json({ state });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
