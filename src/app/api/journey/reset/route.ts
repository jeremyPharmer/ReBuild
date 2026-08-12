import { NextResponse } from "next/server";
import { todayInTz } from "@/lib/journey";
import { resetCurrentRun } from "@/lib/mutations";
import { updateState } from "@/lib/store";

/**
 * Settings → Reset my journey.
 * Same run-reset as legacy evening “return to use”: history kept, counter
 * restarts next calendar day. Does not wipe fund / journals / evenings.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      date?: string;
      notes?: string;
    };
    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const date = String(body.date ?? todayInTz(prev.profile.timezone));
      return resetCurrentRun(
        prev,
        date,
        body.notes ? String(body.notes) : "Reset my journey (Settings)",
      );
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
