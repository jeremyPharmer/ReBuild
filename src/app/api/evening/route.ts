import { NextResponse } from "next/server";
import { getEvening, newId, todayInTz } from "@/lib/journey";
import { pendingCashableMoments } from "@/lib/fund";
import { applyEveningSideEffects } from "@/lib/mutations";
import { updateState } from "@/lib/store";
import type { AlignmentStatus, EveningCheckIn, JournalEntry } from "@/lib/types";

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
      const alignment = body.alignment as AlignmentStatus;
      if (!["aligned", "return_to_use", "other"].includes(alignment)) {
        const err = new Error("Invalid alignment");
        (err as Error & { status: number }).status = 400;
        throw err;
      }
      const evening: EveningCheckIn = {
        date,
        mood: Number(body.mood),
        craving: Number(body.craving),
        alignment,
        returnNotes: body.returnNotes ? String(body.returnNotes) : undefined,
        oneLine: String(body.oneLine ?? "").trim(),
        expandedJournal: body.expandedJournal
          ? String(body.expandedJournal)
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
