import { NextResponse } from "next/server";
import { executeWishlist } from "@/lib/fund";
import { newId } from "@/lib/journey";
import { updateState } from "@/lib/store";
import type { Reward, RewardCategory } from "@/lib/types";

function normalizeUrl(raw: unknown): string | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "create");

    if (action === "execute") {
      const id = String(body.id);
      const actualCost =
        body.actualCost !== undefined ? Number(body.actualCost) : undefined;
      const futurePull =
        body.futurePull === undefined || body.futurePull === null
          ? undefined
          : Number(body.futurePull);
      const state = await updateState((prev) =>
        executeWishlist(
          prev,
          id,
          actualCost,
          body.notes ? String(body.notes) : undefined,
          futurePull,
        ),
      );
      return NextResponse.json({ state });
    }

    if (action === "assign") {
      const id = String(body.id);
      const milestoneDay = Number(body.milestoneDay);
      const state = await updateState((prev) => {
        const current = prev.rewards.find((r) => r.id === id);
        const clearing =
          body.clear === true ||
          current?.assignedMilestoneDay === milestoneDay;
        if (clearing) {
          return {
            ...prev,
            rewards: prev.rewards.map((r) =>
              r.assignedMilestoneDay === milestoneDay
                ? { ...r, assignedMilestoneDay: undefined }
                : r,
            ),
          };
        }
        return {
          ...prev,
          rewards: prev.rewards.map((r) =>
            r.id === id
              ? { ...r, assignedMilestoneDay: milestoneDay }
              : r.assignedMilestoneDay === milestoneDay
                ? { ...r, assignedMilestoneDay: undefined }
                : r,
          ),
        };
      });
      return NextResponse.json({ state });
    }

    if (action === "update") {
      const id = String(body.id ?? "");
      const name = String(body.name ?? "").trim();
      const estimatedCost = Number(body.estimatedCost);
      if (!id || !name || !Number.isFinite(estimatedCost) || estimatedCost < 0) {
        return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
      }
      const state = await updateState((prev) => {
        if (!prev.rewards.some((r) => r.id === id)) {
          throw Object.assign(new Error("Reward not found"), { status: 404 });
        }
        return {
          ...prev,
          rewards: prev.rewards.map((r) =>
            r.id === id
              ? {
                  ...r,
                  name,
                  estimatedCost,
                  category: (body.category as RewardCategory) || r.category,
                  url: normalizeUrl(body.url),
                  assignedMilestoneDay: body.milestoneDay
                    ? Number(body.milestoneDay)
                    : body.milestoneDay === "" || body.milestoneDay === null
                      ? undefined
                      : r.assignedMilestoneDay,
                  notes:
                    body.notes !== undefined
                      ? String(body.notes || "").trim() || undefined
                      : r.notes,
                }
              : r,
          ),
        };
      });
      return NextResponse.json({ state });
    }

    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
      }
      const state = await updateState((prev) => ({
        ...prev,
        rewards: prev.rewards.filter((r) => r.id !== id),
        // Clear milestone assignments that pointed only at this reward — nothing else
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
      url: normalizeUrl(body.url),
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
