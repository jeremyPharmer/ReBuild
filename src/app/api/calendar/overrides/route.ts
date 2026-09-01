import { NextResponse } from "next/server";
import {
  hideCalendarEvent,
  setCalendarTitleOverride,
} from "@/lib/calendar-overrides";
import { updateState } from "@/lib/store";

/** Home agenda overrides: rename or hide an event locally. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventId = String(body.eventId ?? "").trim();
    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      if (body.hide === true) {
        return hideCalendarEvent(prev, eventId);
      }
      if (body.title !== undefined) {
        return setCalendarTitleOverride(prev, eventId, String(body.title));
      }
      const err = new Error("title or hide required");
      (err as Error & { status: number }).status = 400;
      throw err;
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
