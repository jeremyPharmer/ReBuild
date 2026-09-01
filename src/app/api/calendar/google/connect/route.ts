import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import {
  googleAuthorizeUrl,
  googleOAuthConfigured,
  signGoogleOAuthState,
} from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/** Start Google Calendar OAuth (RB-023). */
export async function GET() {
  try {
    if (!googleOAuthConfigured()) {
      return NextResponse.json(
        { error: "Google Calendar OAuth is not configured on this server" },
        { status: 503 },
      );
    }
    const user = await requireSessionUser();
    const state = await signGoogleOAuthState(user.id);
    const url = googleAuthorizeUrl(state);
    return NextResponse.redirect(url);
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
