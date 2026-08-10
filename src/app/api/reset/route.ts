import { NextResponse } from "next/server";
import { emptyState } from "@/lib/journey";
import { writeState } from "@/lib/store";

/** Dev/reset helper — clears all data. Blocked on prod true-source. */
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
  await writeState(emptyState());
  return NextResponse.json({ ok: true });
}
