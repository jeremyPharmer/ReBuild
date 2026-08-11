import { NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email";
import {
  dueReminderKinds,
  localClock,
  markReminderSent,
} from "@/lib/reminders";
import { readState, updateState } from "@/lib/store";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = req.headers.get("x-cron-secret") || "";
  return bearer === secret || alt === secret;
}

/** Hourly (or on-demand) tick: send due morning/evening reminder emails. */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await readState();
  if (!state.profile) {
    return NextResponse.json({ ok: true, sent: [], skipped: "not_onboarded" });
  }

  const due = dueReminderKinds(state);
  if (due.length === 0) {
    return NextResponse.json({ ok: true, sent: [], skipped: "nothing_due" });
  }

  const email = state.profile.email!.trim();
  const { date } = localClock(state.profile.timezone);
  const sent: string[] = [];
  const errors: { kind: string; error: string }[] = [];

  for (const kind of due) {
    const result = await sendReminderEmail({
      to: email,
      kind,
      displayName: state.profile.displayName,
    });
    if (!result.ok) {
      errors.push({ kind, error: result.error });
      continue;
    }
    await updateState((prev) => markReminderSent(prev, kind, date));
    sent.push(kind);
  }

  return NextResponse.json({
    ok: errors.length === 0,
    sent,
    errors: errors.length ? errors : undefined,
  });
}

export async function GET(req: Request) {
  return POST(req);
}
