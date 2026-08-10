import { NextResponse } from "next/server";
import { newId } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { CravingEvent } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "start");

    if (action === "complete") {
      const id = String(body.id);
      const state = await updateState((prev) => ({
        ...prev,
        cravings: prev.cravings.map((c) =>
          c.id === id
            ? {
                ...c,
                intensityAfter: Number(body.intensityAfter),
                outcome: body.outcome ? String(body.outcome) : undefined,
              }
            : c,
        ),
      }));
      return NextResponse.json({ state });
    }

    const event: CravingEvent = {
      id: newId("craving"),
      at: new Date().toISOString(),
      intensityBefore: Number(body.intensityBefore),
      situation: String(body.situation ?? "").trim(),
      intervention: String(body.intervention ?? "").trim(),
    };
    const state = await updateState((prev) => ({
      ...prev,
      cravings: [...prev.cravings, event],
    }));
    return NextResponse.json({ state, craving: event });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
