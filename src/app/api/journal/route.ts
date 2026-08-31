import { NextResponse } from "next/server";
import {
  applyJournalProseEdit,
  toggleStarredDay,
} from "@/lib/journal";
import { getEvening } from "@/lib/journey";
import { savePhotoDataUrl } from "@/lib/photos";
import { updateState } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "");

    if (action === "toggleStar") {
      const date = String(body.date ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "Date must be YYYY-MM-DD" },
          { status: 400 },
        );
      }
      const state = await updateState((prev) => {
        if (!prev.profile) {
          const err = new Error("Not onboarded");
          (err as Error & { status: number }).status = 400;
          throw err;
        }
        // Bookmark only days that already have a closed evening
        if (!getEvening(prev, date) && !prev.starredDays?.includes(date)) {
          const err = new Error(
            "Close the day before starring it as a day to remember",
          );
          (err as Error & { status: number }).status = 400;
          throw err;
        }
        return {
          ...prev,
          starredDays: toggleStarredDay(prev.starredDays, date),
        };
      });
      return NextResponse.json({ state });
    }

    if (action === "updateEntry") {
      const date = String(body.date ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "Date must be YYYY-MM-DD" },
          { status: 400 },
        );
      }
      const oneLine = String(body.oneLine ?? "").trim();
      if (!oneLine) {
        return NextResponse.json(
          { error: "Headline is required" },
          { status: 400 },
        );
      }

      let photoId: string | undefined;
      let attachPhoto = false;
      if (body.photoDataUrl) {
        photoId = await savePhotoDataUrl(String(body.photoDataUrl));
        attachPhoto = true;
      }

      const state = await updateState((prev) => {
        if (!prev.profile) {
          const err = new Error("Not onboarded");
          (err as Error & { status: number }).status = 400;
          throw err;
        }
        if (!getEvening(prev, date)) {
          const err = new Error(
            "No entry to edit — close the day first if it was missed",
          );
          (err as Error & { status: number }).status = 404;
          throw err;
        }
        const expanded =
          body.expandedJournal !== undefined
            ? String(body.expandedJournal)
            : undefined;
        return applyJournalProseEdit(
          prev,
          date,
          oneLine,
          expanded,
          attachPhoto ? photoId : undefined,
        );
      });
      return NextResponse.json({ state });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
