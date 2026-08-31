import { NextResponse } from "next/server";
import { isAppleCalendarConnected } from "@/lib/apple-calendar";
import { todayInTz } from "@/lib/journey";
import { fetchWorkCalendarEvents } from "@/lib/work-calendar";
import { readState } from "@/lib/store";

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
    const events = await fetchWorkCalendarEvents(
      date,
      state.profile.timezone,
    );
    return NextResponse.json({
      date,
      events,
      connected: isAppleCalendarConnected(),
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
