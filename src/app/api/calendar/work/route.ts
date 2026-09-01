import { NextResponse } from "next/server";
import { todayInTz } from "@/lib/journey";
import { fetchWorkCalendarEvents } from "@/lib/work-calendar";
import { readState } from "@/lib/store";

/**
 * Today's calendar agenda (personal iCal + work Google ICS).
 * RB-023 — read-only feeds; not email (RB-002), not todos.
 */
export async function GET(req: Request) {
  try {
    const state = await readState();
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
      },
    );
    return NextResponse.json({ date, events, connected, errors });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
