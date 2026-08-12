import { NextResponse } from "next/server";
import { getEvening, newId, todayInTz } from "@/lib/journey";
import { pendingCashableMoments } from "@/lib/fund";
import { applyEveningSideEffects } from "@/lib/mutations";
import { updateState } from "@/lib/store";
import type { EveningCheckIn, JournalEntry } from "@/lib/types";

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
      if (getEvening(prev, date)) {
        const err = new Error("Evening already completed");
        (err as Error & { status: number }).status = 409;
        throw err;
      }
      const oneLine = String(body.oneLine ?? "").trim();
      if (!oneLine) {
        const err = new Error("One line is required");
        (err as Error & { status: number }).status = 400;
        throw err;
      }

      // Close always counts as aligned for reclaim / milestones.
      // Journey reset is Settings → Reset my journey.
      const evening: EveningCheckIn = {
        date,
        mood: Number(body.mood),
        stress: Number(body.stress),
        craving:
          body.craving !== undefined ? Number(body.craving) : undefined,
        alignment: "aligned",
        oneLine,
        expandedJournal: body.expandedJournal
          ? String(body.expandedJournal).trim() || undefined
          : undefined,
        completedAt: new Date().toISOString(),
      };

      let next = applyEveningSideEffects(prev, evening);

      if (evening.oneLine) {
        const entry: JournalEntry = {
          id: newId("journal"),
          date,
          type: "one_line",
          text: evening.oneLine,
          createdAt: new Date().toISOString(),
        };
        next = { ...next, journals: [...next.journals, entry] };
      }
      if (evening.expandedJournal) {
        const entry: JournalEntry = {
          id: newId("journal"),
          date,
          type: "journal",
          text: evening.expandedJournal,
          createdAt: new Date().toISOString(),
        };
        next = { ...next, journals: [...next.journals, entry] };
      }
      return next;
    });
    return NextResponse.json({
      state,
      pendingRewards: pendingCashableMoments(state),
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
