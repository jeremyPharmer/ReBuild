import { NextResponse } from "next/server";
import { getDeviceUserId, getSessionUser, sessionPublic } from "@/lib/auth";
import { findUserById, readDb } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (user) {
    return NextResponse.json({ user: sessionPublic(user), authenticated: true });
  }

  const deviceUserId = await getDeviceUserId();
  if (deviceUserId) {
    const db = await readDb();
    const deviceUser = findUserById(db, deviceUserId);
    if (deviceUser?.pinHash) {
      return NextResponse.json({
        authenticated: false,
        pinUnlockAvailable: true,
        deviceHint: {
          displayName: deviceUser.displayName,
          email: deviceUser.email,
        },
      });
    }
  }

  return NextResponse.json({ authenticated: false });
}
