import { NextResponse } from "next/server";
import {
  issueSession,
  sessionPublic,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail, readDb } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const remember = Boolean(body.remember);
  const pin = String(body.pin ?? "").trim();

  // PIN path handled by /api/auth/pin-login — keep login password-focused
  if (pin && !password) {
    return NextResponse.json(
      { error: "Use PIN unlock" },
      { status: 400 },
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  const db = await readDb();
  const user = findUserByEmail(db, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const next = await issueSession(user, { remember });
  return NextResponse.json({ user: sessionPublic(next) });
}
