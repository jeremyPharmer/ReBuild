import { NextResponse } from "next/server";
import { setCalendarTitleOverride } from "@/lib/calendar-overrides";
import { updateState } from "@/lib/store";

/** Save a local display title for a calendar event (Home agenda only). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventId = String(body.eventId ?? "").trim();
    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }
    const title = body.title !== undefined ? String(body.title) : "";

    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      return setCalendarTitleOverride(prev, eventId, title);
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
