import { NextResponse } from "next/server";
import {
  fetchAppleCalendarOccurrences,
  isAppleCalendarConnected,
} from "@/lib/apple-calendar";
import { todayInTz } from "@/lib/journey";
import { readState, updateState } from "@/lib/store";

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
    const connected = isAppleCalendarConnected();
    const events = connected
      ? await fetchAppleCalendarOccurrences(date, state.profile.timezone)
      : [];
    const done = new Set(
      (state.calendarCompletions ?? [])
        .filter((c) => c.id.endsWith(`|${date}`) || events.some((e) => e.id === c.id))
        .map((c) => c.id),
    );
    return NextResponse.json({
      date,
      connected,
      events: events.map((e) => ({
        ...e,
        completed: done.has(e.id),
      })),
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "");
    const id = String(body.id ?? "").trim();
    if (!id || (action !== "complete" && action !== "undo")) {
      return NextResponse.json(
        { error: "action must be complete|undo with id" },
        { status: 400 },
      );
    }

    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const completions = prev.calendarCompletions ?? [];
      if (action === "complete") {
        if (completions.some((c) => c.id === id)) {
          return prev;
        }
        return {
          ...prev,
          calendarCompletions: [
            ...completions,
            { id, completedAt: new Date().toISOString() },
          ],
        };
      }
      return {
        ...prev,
        calendarCompletions: completions.filter((c) => c.id !== id),
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
