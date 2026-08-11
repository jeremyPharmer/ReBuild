import { NextResponse } from "next/server";
import { buildDashboard, todayInTz } from "@/lib/journey";
import { pendingCashableMoments } from "@/lib/fund";
import { readState } from "@/lib/store";

export async function GET() {
  const state = await readState();
  const today = state.profile
    ? todayInTz(state.profile.timezone)
    : todayInTz();
  return NextResponse.json({
    state,
    today,
    dashboard: buildDashboard(state, today),
    pendingRewards: pendingCashableMoments(state),
  });
}
