import { NextResponse } from "next/server";
import { getMorning, todayInTz } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { MorningCheckIn } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const date = String(body.date ?? todayInTz(prev.profile.timezone));
      if (getMorning(prev, date)) {
        const err = new Error("Morning already completed");
        (err as Error & { status: number }).status = 409;
        throw err;
      }
      const morning: MorningCheckIn = {
        date,
        sleepHours: Number(body.sleepHours),
        sleepQuality: Number(body.sleepQuality),
        mood: Number(body.mood),
        energy: Number(body.energy),
        stress: Number(body.stress),
        craving: Number(body.craving),
        intention: String(body.intention ?? "").trim(),
        trigger: body.trigger ? String(body.trigger) : undefined,
        notes: body.notes ? String(body.notes) : undefined,
        completedAt: new Date().toISOString(),
      };
      return { ...prev, mornings: [...prev.mornings, morning] };
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
