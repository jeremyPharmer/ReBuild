import { NextResponse } from "next/server";
import { todayInTz } from "@/lib/journey";
import { updateState } from "@/lib/store";
import { applyTodoAction } from "@/lib/todos";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const today = todayInTz(prev.profile.timezone);
      return applyTodoAction(prev, body ?? {}, today, new Date().toISOString());
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
