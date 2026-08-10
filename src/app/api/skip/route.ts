import { NextResponse } from "next/server";
import { todayInTz } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { SkipItemKey } from "@/lib/types";

const ALLOWED = new Set<SkipItemKey>([
  "morning",
  "evening",
  "recovery_content",
  "meditation",
  "medication",
  "gym",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const date = String(body.date ?? todayInTz(prev.profile.timezone));
      const itemKey = String(body.itemKey ?? "") as SkipItemKey;
      if (!ALLOWED.has(itemKey)) {
        const err = new Error("Invalid itemKey");
        (err as Error & { status: number }).status = 400;
        throw err;
      }

      const skips = (prev.skips ?? []).filter(
        (s) => !(s.date === date && s.itemKey === itemKey),
      );

      if (body.clear === true) {
        return { ...prev, skips };
      }

      return {
        ...prev,
        skips: [
          ...skips,
          {
            date,
            itemKey,
            skippedAt: new Date().toISOString(),
          },
        ],
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
