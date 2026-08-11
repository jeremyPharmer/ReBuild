import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";
import { DEFAULT_SUPPORTS, type SupportConfig } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const supports: SupportConfig[] = Array.isArray(body.supports)
        ? body.supports
        : prev.profile.supports ?? DEFAULT_SUPPORTS;
      const historicalDailySpend =
        body.historicalDailySpend !== undefined
          ? Number(body.historicalDailySpend)
          : prev.profile.historicalDailySpend;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          supports,
          historicalDailySpend,
          displayName: body.displayName
            ? String(body.displayName)
            : prev.profile.displayName,
        },
      };
    });
    return NextResponse.json({ state });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
