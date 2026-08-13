import { NextResponse } from "next/server";
import {
  hashPin,
  requireSessionUser,
  sessionPublic,
  validatePin,
} from "@/lib/auth";
import { updateUserRecord } from "@/lib/store";

/** Set or clear the synced 4-digit PIN for the signed-in user. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();
  const clear = Boolean(body.clear);

  try {
    const user = await requireSessionUser();
    if (clear) {
      const next = await updateUserRecord(user.id, (u) => ({
        ...u,
        pinHash: undefined,
      }));
      return NextResponse.json({ user: sessionPublic(next) });
    }
    if (!validatePin(pin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 },
      );
    }
    const pinHash = await hashPin(pin);
    const next = await updateUserRecord(user.id, (u) => ({ ...u, pinHash }));
    return NextResponse.json({ user: sessionPublic(next) });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
