import { NextResponse } from "next/server";
import { newId } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { Reward, RewardCategory } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "create");

    if (action === "execute") {
      const id = String(body.id);
      const actualCost =
        body.actualCost !== undefined ? Number(body.actualCost) : undefined;
      const state = await updateState((prev) => ({
        ...prev,
        rewards: prev.rewards.map((r) =>
          r.id === id
            ? {
                ...r,
                executed: true,
                executedAt: new Date().toISOString(),
                actualCost: actualCost ?? r.estimatedCost,
                notes: body.notes ? String(body.notes) : r.notes,
              }
            : r,
        ),
      }));
      return NextResponse.json({ state });
    }

    if (action === "assign") {
      const id = String(body.id);
      const milestoneDay = Number(body.milestoneDay);
      const state = await updateState((prev) => ({
        ...prev,
        rewards: prev.rewards.map((r) =>
          r.id === id
            ? { ...r, assignedMilestoneDay: milestoneDay }
            : r.assignedMilestoneDay === milestoneDay
              ? { ...r, assignedMilestoneDay: undefined }
              : r,
        ),
      }));
      return NextResponse.json({ state });
    }

    const reward: Reward = {
      id: newId("reward"),
      name: String(body.name ?? "").trim(),
      category: (body.category as RewardCategory) || "other",
      estimatedCost: Number(body.estimatedCost),
      assignedMilestoneDay: body.milestoneDay
        ? Number(body.milestoneDay)
        : undefined,
      executed: false,
      notes: body.notes ? String(body.notes) : undefined,
      createdAt: new Date().toISOString(),
    };
    if (!reward.name || !Number.isFinite(reward.estimatedCost)) {
      return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
    }
    const state = await updateState((prev) => ({
      ...prev,
      rewards: [...prev.rewards, reward],
    }));
    return NextResponse.json({ state });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}
