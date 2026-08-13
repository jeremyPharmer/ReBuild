import { NextResponse } from "next/server";
import { getSessionUser, sessionPublic } from "@/lib/auth";
import { buildDashboard, emptyState, todayInTz } from "@/lib/journey";
import { pendingCashableMoments } from "@/lib/fund";
import { ensureMilestonesReached } from "@/lib/mutations";
import { updateState } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
        state: emptyState(),
        today: todayInTz(),
        dashboard: null,
        pendingRewards: [],
        env: process.env.REBUILD_ENV === "prod" ? "prod" : "dev",
      },
      { status: 401 },
    );
  }

  const state = await updateState((prev) => {
    if (!prev.profile) return prev;
    const today = todayInTz(prev.profile.timezone);
    return ensureMilestonesReached(prev, today);
  });
  const today = state.profile
    ? todayInTz(state.profile.timezone)
    : todayInTz();
  return NextResponse.json({
    authenticated: true,
    user: sessionPublic(user),
    state,
    today,
    dashboard: buildDashboard(state, today),
    pendingRewards: pendingCashableMoments(state),
    env: process.env.REBUILD_ENV === "prod" ? "prod" : "dev",
  });
}
