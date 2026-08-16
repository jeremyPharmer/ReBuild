import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth-constants";
import { requireSessionUser } from "@/lib/auth";
import { lastActiveDay } from "@/lib/journey";
import { listUsers } from "@/lib/store";

export async function GET() {
  try {
    const me = await requireSessionUser();
    if (!isAdminEmail(me.email)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    const users = await listUsers();
    return NextResponse.json({
      users: users
        .map((u) => ({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          createdAt: u.createdAt,
          lastActiveDay: lastActiveDay(u.state),
          onboarded: Boolean(u.state.profile?.onboarded),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
