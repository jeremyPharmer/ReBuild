import { NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email";
import {
  localClock,
  markReminderSent,
  normalizeReminders,
  remindersGloballyEnabled,
  type ReminderKind,
} from "@/lib/reminders";
import { readState, updateState } from "@/lib/store";

/** Manual test send from Settings (N=1). */
export async function POST(req: Request) {
  try {
    if (!remindersGloballyEnabled()) {
      return NextResponse.json(
        { error: "Email reminders are disabled" },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const kind = (body.kind === "evening" ? "evening" : "morning") as ReminderKind;
    const state = await readState();
    if (!state.profile) {
      return NextResponse.json({ error: "Not onboarded" }, { status: 400 });
    }
    const email = String(body.email || state.profile.email || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Add an email in Settings first" },
        { status: 400 },
      );
    }

    const result = await sendReminderEmail({
      to: email,
      kind,
      state,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 500 },
      );
    }

    const prefs = normalizeReminders(state.profile.reminders);
    const kindOn =
      kind === "morning" ? prefs.morningEnabled : prefs.eveningEnabled;
    if (kindOn) {
      const { date } = localClock(state.profile.timezone);
      await updateState((prev) => markReminderSent(prev, kind, date));
    }

    return NextResponse.json({ ok: true, id: result.id, kind });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
