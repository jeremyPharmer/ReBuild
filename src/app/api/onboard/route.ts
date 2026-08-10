import { NextResponse } from "next/server";
import { newId } from "@/lib/journey";
import { updateState } from "@/lib/store";
import { DEFAULT_SUPPORTS, type SupportConfig } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const displayName = String(body.displayName ?? "Founder").trim() || "Founder";
  const historicalDailySpend = Number(body.historicalDailySpend);
  if (!Number.isFinite(historicalDailySpend) || historicalDailySpend < 0) {
    return NextResponse.json(
      { error: "historicalDailySpend required" },
      { status: 400 },
    );
  }

  const supports: SupportConfig[] = Array.isArray(body.supports)
    ? body.supports
    : DEFAULT_SUPPORTS;

  const startDate = String(body.startDate ?? "").trim();
  const timezone = String(body.timezone ?? "America/Los_Angeles");

  const state = await updateState((prev) => {
    const today =
      startDate ||
      new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

    const runId = newId("run");
    return {
      ...prev,
      profile: {
        id: prev.profile?.id ?? newId("user"),
        createdAt: prev.profile?.createdAt ?? new Date().toISOString(),
        onboarded: true,
        displayName,
        historicalDailySpend,
        startDate: today,
        currentRunId: runId,
        currentRunStartedOn: today,
        supports,
        timezone,
      },
    };
  });

  return NextResponse.json({ state });
}
