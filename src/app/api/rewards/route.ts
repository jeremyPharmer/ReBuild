import { NextResponse } from "next/server";
import { REWARDS } from "@/lib/incentives";

export async function GET() {
  return NextResponse.json({ rewards: REWARDS });
}
