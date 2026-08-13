import { NextResponse } from "next/server";
import {
  getDeviceUserId,
  issueSession,
  sessionPublic,
  validatePin,
  verifyPin,
} from "@/lib/auth";
import { findUserByEmail, findUserById, readDb } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const remember = Boolean(body.remember);

  if (!validatePin(pin)) {
    return NextResponse.json(
      { error: "PIN must be exactly 4 digits" },
      { status: 400 },
    );
  }

  const db = await readDb();
  let user = email ? findUserByEmail(db, email) : undefined;
  if (!user) {
    const deviceId = await getDeviceUserId();
    if (deviceId) user = findUserById(db, deviceId);
  }

  if (!user?.pinHash || !(await verifyPin(pin, user.pinHash))) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const next = await issueSession(user, { remember });
  return NextResponse.json({ user: sessionPublic(next) });
}
