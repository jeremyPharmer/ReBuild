import { NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/google-calendar";
import {
  buildGoogleCalendarLink,
  exchangeGoogleAuthCode,
  fetchGoogleAccountEmail,
  googleOAuthConfigured,
  verifyGoogleOAuthState,
} from "@/lib/google-calendar";
import { updateUserRecord } from "@/lib/store";

export const dynamic = "force-dynamic";

/** OAuth callback — store refresh token on the signed-in user. */
export async function GET(req: Request) {
  const settingsUrl = new URL("/settings", appBaseUrl());

  try {
    if (!googleOAuthConfigured()) {
      settingsUrl.searchParams.set("calendar", "unconfigured");
      return NextResponse.redirect(settingsUrl);
    }

    const url = new URL(req.url);
    const error = url.searchParams.get("error");
    if (error) {
      settingsUrl.searchParams.set("calendar", "denied");
      return NextResponse.redirect(settingsUrl);
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      settingsUrl.searchParams.set("calendar", "error");
      return NextResponse.redirect(settingsUrl);
    }

    const userId = await verifyGoogleOAuthState(state);
    if (!userId) {
      settingsUrl.searchParams.set("calendar", "error");
      return NextResponse.redirect(settingsUrl);
    }

    const tokens = await exchangeGoogleAuthCode(code);
    if (!tokens.refreshToken) {
      settingsUrl.searchParams.set("calendar", "no-refresh");
      return NextResponse.redirect(settingsUrl);
    }

    const accountEmail = await fetchGoogleAccountEmail(tokens.accessToken);

    await updateUserRecord(userId, (user) => ({
      ...user,
      googleCalendar: buildGoogleCalendarLink({
        refreshToken: tokens.refreshToken!,
        accountEmail,
        calendarId: "primary",
      }),
    }));

    settingsUrl.searchParams.set("calendar", "connected");
    return NextResponse.redirect(settingsUrl);
  } catch {
    settingsUrl.searchParams.set("calendar", "error");
    return NextResponse.redirect(settingsUrl);
  }
}
