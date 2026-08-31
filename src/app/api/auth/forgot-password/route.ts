import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { hashResetToken } from "@/lib/auth";
import { findUserByEmail, updateDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { isProdEnv } from "@/lib/env";

function appBaseUrl(req: Request): string {
  return (
    process.env.APP_URL?.replace(/\/$/, "") ||
    new URL(req.url).origin
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();

  // Always return ok to avoid account enumeration
  const okResponse = (extra?: Record<string, unknown>) =>
    NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, reset instructions were sent.",
      ...extra,
    });

  if (!email.includes("@")) {
    return okResponse();
  }

  const token = randomBytes(24).toString("hex");
  const tokenHash = await hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  let found = false;
  await updateDb((db) => {
    const user = findUserByEmail(db, email);
    if (!user) return db;
    found = true;
    return {
      ...db,
      users: db.users.map((u) =>
        u.id === user.id
          ? { ...u, passwordReset: { tokenHash, expiresAt } }
          : u,
      ),
    };
  });

  if (!found) return okResponse();

  const resetUrl = `${appBaseUrl(req)}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  let emailed = false;
  if (process.env.RESEND_API_KEY) {
    const result = await sendEmail({
      to: email,
      subject: "Reset your JeremyOS password",
      html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in one hour.</p>`,
      text: `Reset your JeremyOS password: ${resetUrl}\nThis link expires in one hour.`,
    });
    emailed = result.ok;
  }

  // Until email is fully wired (RB-002), surface the link on non-prod for testing
  const exposeLink = !isProdEnv() || !process.env.RESEND_API_KEY;

  return okResponse({
    emailed,
    ...(exposeLink ? { resetUrl, devHint: "Email later — use resetUrl for now" } : {}),
  });
}
