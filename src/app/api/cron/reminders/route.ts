import { NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email";
import {
  dueReminderKinds,
  localClock,
  markReminderSent,
} from "@/lib/reminders";
import { listUsers, updateUserStateById } from "@/lib/store";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = req.headers.get("x-cron-secret") || "";
  return bearer === secret || alt === secret;
}

/** Hourly tick: send due morning/evening reminder emails for all users. */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listUsers();
  const sent: { userId: string; kind: string }[] = [];
  const errors: { userId: string; kind: string; error: string }[] = [];
  let skipped = 0;

  for (const user of users) {
    const state = user.state;
    if (!state.profile?.onboarded) {
      skipped++;
      continue;
    }
    const due = dueReminderKinds(state);
    if (due.length === 0) {
      skipped++;
      continue;
    }
    const email = (state.profile.email || user.email).trim();
    if (!email) {
      skipped++;
      continue;
    }
    const { date } = localClock(state.profile.timezone);

    for (const kind of due) {
      const result = await sendReminderEmail({
        to: email,
        kind,
        displayName: state.profile.displayName || user.displayName,
      });
      if (!result.ok) {
        errors.push({ userId: user.id, kind, error: result.error });
        continue;
      }
      await updateUserStateById(user.id, (prev) =>
        markReminderSent(prev, kind, date),
      );
      sent.push({ userId: user.id, kind });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    sent,
    errors: errors.length ? errors : undefined,
    skipped,
  });
}

export async function GET(req: Request) {
  return POST(req);
}
