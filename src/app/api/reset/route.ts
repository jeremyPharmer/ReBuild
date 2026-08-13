import { NextResponse } from "next/server";
import { emptyState } from "@/lib/journey";
import { resetCurrentUserState } from "@/lib/store";

/** Dev helper — clears the signed-in user's journey data. Blocked on prod. */
export async function POST() {
  if (process.env.REBUILD_ENV === "prod") {
    return NextResponse.json(
      {
        error:
          "Reset is disabled on prod. Use rebuild-dev for test wipes.",
      },
      { status: 403 },
    );
  }
  const state = await resetCurrentUserState();
  return NextResponse.json({ ok: true, state: state ?? emptyState() });
}
