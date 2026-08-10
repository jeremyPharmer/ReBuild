import { NextResponse } from "next/server";
import { getUser, saveUser } from "@/lib/store";
import { applyCheckIn, DomainError, toDateString } from "@/lib/incentives";

export async function POST(request: Request) {
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }

  const user = await getUser(id);
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const today = toDateString(new Date());
  try {
    const result = applyCheckIn(user, today);
    await saveUser(result.user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof DomainError && err.code === "ALREADY_CHECKED_IN") {
      return NextResponse.json({ error: err.code }, { status: 409 });
    }
    throw err;
  }
}
