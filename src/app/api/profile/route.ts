import { NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }
  const user = await getUser(id);
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  let body: { name?: string; goal?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const name = body.name?.trim();
  const goal = body.goal?.trim() || "Recovery";
  if (!name) {
    return NextResponse.json({ error: "MISSING_NAME" }, { status: 400 });
  }

  const user = await createUser(name, goal);
  return NextResponse.json({ user }, { status: 201 });
}
