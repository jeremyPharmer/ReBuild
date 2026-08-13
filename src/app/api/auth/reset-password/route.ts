import { NextResponse } from "next/server";
import {
  hashPassword,
  issueSession,
  sessionPublic,
  verifyResetToken,
} from "@/lib/auth";
import { findUserByEmail, updateDb, type UserRecord } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const token = String(body.token ?? "").trim();
  const password = String(body.password ?? "");
  const confirm = String(body.confirmPassword ?? body.confirm ?? "");

  if (!email || !token) {
    return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  let matched: UserRecord | null = null;
  await updateDb(async (db) => {
    const user = findUserByEmail(db, email);
    if (!user?.passwordReset) return db;
    const { tokenHash, expiresAt } = user.passwordReset;
    if (new Date(expiresAt).getTime() < Date.now()) return db;
    if (!(await verifyResetToken(token, tokenHash))) return db;

    const passwordHash = await hashPassword(password);
    matched = {
      ...user,
      passwordHash,
      passwordReset: null,
    };
    return {
      ...db,
      users: db.users.map((u) => (u.id === user.id ? matched! : u)),
    };
  });

  if (!matched) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 400 },
    );
  }

  const next = await issueSession(matched, { remember: false });
  return NextResponse.json({ user: sessionPublic(next) });
}
