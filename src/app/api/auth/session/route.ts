import { NextResponse } from "next/server";
import {
  getSessionUser,
  issueSession,
  sessionPublic,
} from "@/lib/auth";

/** Refresh session cookie (e.g. toggle remember-me). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const remember = Boolean(body.remember);
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const next = await issueSession(user, { remember, touchLogin: true });
  return NextResponse.json({ user: sessionPublic(next) });
}
