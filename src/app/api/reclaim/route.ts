import { NextResponse } from "next/server";
import { confirmTransfer, confirmWeeklyBonus } from "@/lib/mutations";
import { updateState } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "transfer");

    if (action === "weekly_bonus") {
      const bonusId = String(body.bonusId ?? "");
      const state = await updateState((prev) =>
        confirmWeeklyBonus(prev, bonusId),
      );
      return NextResponse.json({ state });
    }

    const dayDates: string[] = Array.isArray(body.dayDates)
      ? body.dayDates.map(String)
      : [];
    const amount = Number(body.amount);
    if (dayDates.length === 0 || !Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid transfer" }, { status: 400 });
    }

    const state = await updateState((prev) => {
      const eligible = new Set(
        prev.reclaimDays.filter((d) => !d.accounted).map((d) => d.date),
      );
      for (const d of dayDates) {
        if (!eligible.has(d)) {
          const err = new Error(`Day ${d} is not available to reclaim`);
          (err as Error & { status: number }).status = 400;
          throw err;
        }
      }
      return confirmTransfer(
        prev,
        dayDates,
        amount,
        body.note ? String(body.note) : undefined,
      );
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
