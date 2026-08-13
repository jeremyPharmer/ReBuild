import { NextResponse } from "next/server";
import { newId, todayInTz } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { DayProvision } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "add");

    const state = await updateState((prev) => {
      if (!prev.profile) {
        const err = new Error("Not onboarded");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const date = String(body.date ?? todayInTz(prev.profile.timezone));
      const provisions = prev.dayProvisions ?? [];

      if (action === "add") {
        const label = String(body.label ?? "").trim();
        if (!label) {
          const err = new Error("Provision label is required");
          (err as Error & { status: number }).status = 400;
          throw err;
        }
        const row: DayProvision = {
          id: newId("prov"),
          date,
          label,
          completed: false,
        };
        return { ...prev, dayProvisions: [...provisions, row] };
      }

      if (action === "complete" || action === "undo") {
        const id = String(body.id ?? "");
        const row = provisions.find((p) => p.id === id);
        if (!row) {
          const err = new Error("Provision not found");
          (err as Error & { status: number }).status = 404;
          throw err;
        }
        const completed = action === "complete";
        return {
          ...prev,
          dayProvisions: provisions.map((p) =>
            p.id === id
              ? {
                  ...p,
                  completed,
                  completedAt: completed
                    ? new Date().toISOString()
                    : undefined,
                }
              : p,
          ),
        };
      }

      if (action === "remove") {
        const id = String(body.id ?? "");
        return {
          ...prev,
          dayProvisions: provisions.filter((p) => p.id !== id),
        };
      }

      const err = new Error("Unknown action");
      (err as Error & { status: number }).status = 400;
      throw err;
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
