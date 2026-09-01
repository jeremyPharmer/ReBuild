import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import {
  googleCalendarStatus,
  googleOAuthConfigured,
} from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/** Google Calendar connection status for Settings / Home. */
export async function GET() {
  try {
    const user = await requireSessionUser();
    return NextResponse.json({
      configured: googleOAuthConfigured(),
      ...googleCalendarStatus(user.googleCalendar),
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
