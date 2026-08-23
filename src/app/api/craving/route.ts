import { NextResponse } from "next/server";
import { newId } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { CravingEvent } from "@/lib/types";

function normalizeOutcomes(body: Record<string, unknown>): string[] | undefined {
  if (Array.isArray(body.outcomes)) {
    const list = body.outcomes
      .map((o) => String(o).trim())
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  if (body.outcome) {
    const one = String(body.outcome).trim();
    return one ? [one] : undefined;
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "start");

    if (action === "complete") {
      const id = String(body.id);
      const outcomes = normalizeOutcomes(body);
      const state = await updateState((prev) => ({
        ...prev,
        cravings: prev.cravings.map((c) => {
          if (c.id !== id) return c;
          const rawAfter = Number(body.intensityAfter);
          const capped = Number.isFinite(rawAfter)
            ? Math.min(rawAfter, c.intensityBefore)
            : c.intensityBefore;
          return {
            ...c,
            intensityAfter: Math.max(0, capped),
            outcomes,
            outcome: outcomes?.join(", "),
          };
        }),
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
