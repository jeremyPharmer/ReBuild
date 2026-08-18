import { NextResponse } from "next/server";
import { RECOVERY_CONTENT_CATALOG } from "@/lib/podcasts";
import { updateState } from "@/lib/store";
import type { SupportCompletion } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || "listened");
    const id = String(body.id || "");
    if (!id || !RECOVERY_CONTENT_CATALOG.some((e) => e.id === id)) {
      return NextResponse.json({ error: "Unknown episode" }, { status: 400 });
    }

    if (action === "unlistened") {
      const state = await updateState((prev) => ({
        ...prev,
        listenedPodcasts: (prev.listenedPodcasts ?? []).filter((x) => x !== id),
      }));
      return NextResponse.json({ state });
    }

    const state = await updateState((prev) => {
      const listened = new Set(prev.listenedPodcasts ?? []);
      if (listened.has(id)) return prev;
      listened.add(id);

      let supports = prev.supports;
      const date = String(body.date || "");
      if (date && prev.profile) {
        const already = prev.supports.some(
          (s) =>
            s.date === date &&
            s.supportType === "recovery_content" &&
            s.completed,
        );
        if (!already) {
          const row: SupportCompletion = {
            date,
            supportType: "recovery_content",
            completed: true,
            completedAt: new Date().toISOString(),
          };
          const existing = prev.supports.find(
            (s) => s.date === date && s.supportType === "recovery_content",
          );
          supports = existing
            ? prev.supports.map((s) =>
                s.date === date && s.supportType === "recovery_content"
                  ? row
                  : s,
              )
            : [...prev.supports, row];
        }
      }

      return {
        ...prev,
        listenedPodcasts: [...listened],
        supports,
        skips: date
          ? (prev.skips ?? []).filter(
              (s) => !(s.date === date && s.itemKey === "recovery_content"),
            )
          : prev.skips,
      };
    });

    return NextResponse.json({ state });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
