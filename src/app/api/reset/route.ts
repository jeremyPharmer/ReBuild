import { NextResponse } from "next/server";
import { emptyState } from "@/lib/journey";
import { writeState } from "@/lib/store";

/** Dev/reset helper — clears all data. No auth in V1. */
export async function POST() {
  await writeState(emptyState());
  return NextResponse.json({ ok: true });
}
