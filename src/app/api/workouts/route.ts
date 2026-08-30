import { NextResponse } from "next/server";
import { todayInTz, newId } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { WorkoutLog } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "log");

    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }

      const workouts = [...(prev.workouts ?? [])];

      if (action === "delete") {
        const id = String(body.id ?? "");
        return {
          ...prev,
          workouts: workouts.filter((w) => w.id !== id),
        };
      }

      const date = String(body.date ?? todayInTz(prev.profile.timezone));
      const label = String(body.label ?? "").trim();
      if (!label) {
        const err = new Error("Workout label required");
        (err as Error & { status: number }).status = 400;
        throw err;
      }

      const row: WorkoutLog = {
        id: newId(),
        date,
        label,
        durationMin:
          body.durationMin != null ? Number(body.durationMin) : undefined,
        notes: body.notes ? String(body.notes) : undefined,
        createdAt: new Date().toISOString(),
      };

      return { ...prev, workouts: [row, ...workouts] };
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
