import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/store";
import { DomainError, redeemReward, toDateString } from "@/lib/incentives";

export async function POST(request: Request) {
  let body: { id?: string; rewardId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { id, rewardId } = body;
  if (!id || !rewardId) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const user = await getUser(id);
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    const updated = redeemReward(user, rewardId, toDateString(new Date()));
    await saveUser(updated);
    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof DomainError) {
      const status = err.code === "UNKNOWN_REWARD" ? 404 : 400;
      return NextResponse.json({ error: err.code }, { status });
    }
    throw err;
  }
}
