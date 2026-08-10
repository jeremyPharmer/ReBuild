import { NextResponse } from "next/server";
import { todayInTz } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { SupportCompletion, SupportType } from "@/lib/types";

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
      const supportType = body.supportType as SupportType;
      const completed = body.completed !== false;
      const existing = prev.supports.find(
        (s) => s.date === date && s.supportType === supportType,
      );
      const row: SupportCompletion = {
        date,
        supportType,
        completed,
        notes: body.notes ? String(body.notes) : undefined,
        actionNote: body.actionNote ? String(body.actionNote) : undefined,
        completedAt: new Date().toISOString(),
      };
      const supports = existing
        ? prev.supports.map((s) =>
            s.date === date && s.supportType === supportType ? row : s,
          )
        : [...prev.supports, row];
      return { ...prev, supports };
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
