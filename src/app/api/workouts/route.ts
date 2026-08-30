import { NextResponse } from "next/server";
import { todayInTz, newId } from "@/lib/journey";
import { normalizeWorkout } from "@/lib/workouts";
import { updateState } from "@/lib/store";
import type { LiftType, WorkoutCategory, WorkoutLog, WorkoutPr } from "@/lib/types";

function parseCategory(raw: unknown): WorkoutCategory {
  return raw === "run" ? "run" : "lift";
}

function parseLiftType(raw: unknown): LiftType | undefined {
  if (raw === "hiit" || raw === "stretch" || raw === "weights") return raw;
  return undefined;
}

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

      const workouts = [...(prev.workouts ?? [])].map(normalizeWorkout);
      const workoutPrs = [...(prev.workoutPrs ?? [])];

      if (action === "delete") {
        const id = String(body.id ?? "");
        return {
          ...prev,
          workouts: workouts.filter((w) => w.id !== id),
        };
      }

      if (action === "delete_pr") {
        const id = String(body.id ?? "");
        return {
          ...prev,
          workoutPrs: workoutPrs.filter((p) => p.id !== id),
        };
      }

      if (action === "set_pr") {
        const category = parseCategory(body.category);
        const name = String(body.name ?? "").trim();
        const value = Number(body.value);
        if (!name || !Number.isFinite(value)) {
          const err = new Error("PR name and value required");
          (err as Error & { status: number }).status = 400;
          throw err;
        }
        const row: WorkoutPr = {
          id: newId(),
          category,
          liftType:
            category === "lift" ? parseLiftType(body.liftType) ?? "weights" : undefined,
          name,
          value,
          unit: String(body.unit ?? "").trim() || (category === "run" ? "mi" : "lb"),
          date: String(body.date ?? todayInTz(prev.profile.timezone)),
          workoutId: body.workoutId ? String(body.workoutId) : undefined,
          notes: body.notes ? String(body.notes) : undefined,
          createdAt: new Date().toISOString(),
        };
        return { ...prev, workoutPrs: [row, ...workoutPrs] };
      }

      const date = String(body.date ?? todayInTz(prev.profile.timezone));
      const category = parseCategory(body.category);
      const label = String(body.label ?? "").trim();
      if (!label) {
        const err = new Error("Workout label required");
        (err as Error & { status: number }).status = 400;
        throw err;
      }

      const row: WorkoutLog = {
        id: newId(),
        date,
        category,
        liftType:
          category === "lift" ? parseLiftType(body.liftType) ?? "weights" : undefined,
        label,
        durationMin:
          body.durationMin != null ? Number(body.durationMin) : undefined,
        distanceMiles:
          body.distanceMiles != null ? Number(body.distanceMiles) : undefined,
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
