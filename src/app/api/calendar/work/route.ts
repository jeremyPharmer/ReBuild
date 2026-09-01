import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { normalizeState } from "@/lib/fund";
import { todayInTz } from "@/lib/journey";
import { fetchWorkCalendarEvents } from "@/lib/work-calendar";

export const dynamic = "force-dynamic";

/**
 * Today's calendar agenda (personal iCal + Google OAuth + work ICS fallback).
 * RB-023 — read-only; not email (RB-002), not todos.
 */
export async function GET(req: Request) {
  try {
    const user = await requireSessionUser();
    const state = normalizeState(user.state);
    if (!state.profile) {
      return NextResponse.json({ error: "Not onboarded" }, { status: 400 });
    }
    const url = new URL(req.url);
    const date = String(
      url.searchParams.get("date") ?? todayInTz(state.profile.timezone),
    );
    const { events, connected, errors } = await fetchWorkCalendarEvents(
      date,
      state.profile.timezone,
      {
        personalIcalUrl: state.profile.personalIcalUrl,
        workIcalUrl: state.profile.workIcalUrl,
        googleCalendar: user.googleCalendar,
      },
    );
    return NextResponse.json({ date, events, connected, errors });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
