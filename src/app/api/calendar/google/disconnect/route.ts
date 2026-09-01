import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { updateUserRecord } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Disconnect Google Calendar OAuth for the signed-in user. */
export async function POST() {
  try {
    const user = await requireSessionUser();
    await updateUserRecord(user.id, (current) => {
      const { googleCalendar: _removed, ...rest } = current;
      return rest;
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
