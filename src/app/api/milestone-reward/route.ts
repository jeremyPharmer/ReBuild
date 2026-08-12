import { NextResponse } from "next/server";
import {
  claimCelebration,
  eligibleWishlist,
  mustTreat,
  pendingCashableMoments,
  saveCompound,
  treatYourself,
} from "@/lib/fund";
import { newId, suggestedRewardPool } from "@/lib/journey";
import { savePhotoDataUrl } from "@/lib/photos";
import { updateState } from "@/lib/store";
import type { RewardCategory } from "@/lib/types";

export async function GET() {
  const { readState } = await import("@/lib/store");
  const state = await readState();
  const pending = pendingCashableMoments(state);
  const daily = state.profile?.historicalDailySpend ?? 0;
  return NextResponse.json({
    pending,
    mustTreat: mustTreat(state),
    consecutiveSaves: state.consecutiveSaves,
    treatPool: state.fund.treat,
    fund: state.fund,
    eligible: eligibleWishlist(state),
    suggestions: pending.map((p) => ({
      milestoneId: p.id,
      dayNumber: p.dayNumber,
      suggested: suggestedRewardPool(p.dayNumber, daily),
    })),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "");

    let photoId: string | undefined;
    if (body.photoDataUrl) {
      photoId = await savePhotoDataUrl(String(body.photoDataUrl));
    }

    if (action === "save") {
      const state = await updateState((prev) =>
        saveCompound(prev, String(body.milestoneAchievementId)),
      );
      return NextResponse.json({
        state,
        pending: pendingCashableMoments(state),
      });
    }

    if (action === "claim") {
      // Free-text celebration when nothing is assigned to the milestone.
      const state = await updateState((prev) =>
        claimCelebration(
          prev,
          String(body.milestoneAchievementId),
          String(body.name ?? ""),
          body.note ? String(body.note) : undefined,
          photoId,
        ),
      );
      return NextResponse.json({
        state,
        pending: pendingCashableMoments(state),
      });
    }

    if (action === "treat") {
      const state = await updateState((prev) => {
        let next = prev;
        let rewardId = body.rewardId ? String(body.rewardId) : "";

        // Create wishlist item in-flow if needed
        if (!rewardId && body.newReward) {
          const name = String(body.newReward.name ?? "").trim();
          const estimatedCost = Number(body.newReward.estimatedCost);
          if (!name || !Number.isFinite(estimatedCost) || estimatedCost <= 0) {
            throw Object.assign(new Error("Invalid wishlist item"), {
              status: 400,
            });
          }
          const rawUrl = String(body.newReward.url ?? "").trim();
          const url = rawUrl
            ? /^https?:\/\//i.test(rawUrl)
              ? rawUrl
              : `https://${rawUrl}`
            : undefined;
          rewardId = newId("reward");
          next = {
            ...next,
            rewards: [
              ...next.rewards,
              {
                id: rewardId,
                name,
                category:
                  (body.newReward.category as RewardCategory) || "other",
                estimatedCost,
                url,
                executed: false,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }

        const futurePull =
          body.futurePull === undefined || body.futurePull === null
            ? undefined
            : Number(body.futurePull);

        const actualCost =
          body.actualCost === undefined || body.actualCost === null
            ? undefined
            : Number(body.actualCost);

        return treatYourself(
          next,
          String(body.milestoneAchievementId),
          rewardId,
          body.note ? String(body.note) : undefined,
          futurePull,
          photoId,
          actualCost,
        );
      });
      return NextResponse.json({
        state,
        pending: pendingCashableMoments(state),
      });
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
