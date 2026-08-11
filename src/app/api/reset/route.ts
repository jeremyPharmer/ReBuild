import { NextResponse } from "next/server";
import { emptyState } from "@/lib/journey";
import { writeState } from "@/lib/store";

/**
 * Dev-only reset. Disabled on prod so deploys / accidents never wipe
 * founder history. Prod data lives on the Fly volume `rebuild_prod_data`.
 */
export async function POST() {
  if (process.env.REBUILD_ENV === "prod") {
    return NextResponse.json(
      {
        error:
          "Reset is disabled on prod. History is retained across deploys.",
      },
      { status: 403 },
    );
  }
  await writeState(emptyState());
  return NextResponse.json({ ok: true });
}
