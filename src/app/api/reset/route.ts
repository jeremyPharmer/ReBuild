import { NextResponse } from "next/server";
import { emptyState } from "@/lib/journey";
import { isProdEnv } from "@/lib/env";
import { resetCurrentUserState } from "@/lib/store";

/** Dev helper — clears the signed-in user's journey data. Blocked on prod. */
export async function POST() {
  if (isProdEnv()) {
    return NextResponse.json(
      {
        error:
          "Reset is disabled on prod. Wipe locally via .data/db.json or npm run dev.",
      },
      { status: 403 },
    );
  }
  const state = await resetCurrentUserState();
  return NextResponse.json({ ok: true, state: state ?? emptyState() });
}
