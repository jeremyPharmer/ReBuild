"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Money, PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  eligibleWishlist,
  fundTotal,
  mustTreat,
  pendingCashableMoments,
} from "@/lib/fund";
import type { MilestoneAchievement } from "@/lib/types";

export function MilestoneRewardMoment({
  moment,
  onDone,
}: {
  moment: MilestoneAchievement;
  onDone: () => void;
}) {
  const { state, post } = useApp();
  const forced = mustTreat(state);
  const isDestination = moment.type === "destination";
  const treatBal = state.fund.treat ?? 0;
  const futureBal = state.fund.future ?? 0;
  const [mode, setMode] = useState<"choose" | "save" | "treat">(
    forced ? "treat" : "choose",
  );
  const [rewardId, setRewardId] = useState("");
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [note, setNote] = useState("");
  const [pullFuture, setPullFuture] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneMsg, setDoneMsg] = useState("");

  const eligible = useMemo(() => eligibleWishlist(state), [state]);
  const selectedCost = rewardId
    ? (state.rewards.find((r) => r.id === rewardId)?.estimatedCost ?? 0)
    : Number(newCost) || 0;
  const deficit = Math.max(0, Math.round((selectedCost - treatBal) * 100) / 100);
  const needsPull = deficit > 0;

  async function doSave() {
    setBusy(true);
    setError("");
    try {
      await post("/api/milestone-reward", {
        action: "save",
        milestoneAchievementId: moment.id,
      });
      setDoneMsg("Saved for the Future — short-term Treat stays parked.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function doTreat() {
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        action: "treat",
        milestoneAchievementId: moment.id,
        note: note || undefined,
        futurePull: needsPull && pullFuture ? deficit : needsPull ? 0 : undefined,
      };
      if (rewardId) body.rewardId = rewardId;
      else
        body.newReward = {
          name: newName,
          estimatedCost: Number(newCost),
          category: "wellness",
        };
      await post("/api/milestone-reward", body);
      setDoneMsg("Treat logged under What I Rebuilt.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (doneMsg) {
    return (
      <section className="panel success-pop">
        <p className="eyebrow">Done</p>
        <h2>{doneMsg}</h2>
      </section>
    );
  }

  return (
    <section className="panel fade-in">
      <p className="eyebrow">
        {isDestination ? "Destination" : "Reward"} · Day {moment.dayNumber}
      </p>
      <h2>{moment.title}</h2>
      {isDestination && (
        <p style={{ marginTop: 8, lineHeight: 1.45 }}>
          This is a big deal. Treat Yourself if you can — you earned a tangible
          moment.
        </p>
      )}
      <p className="tiny" style={{ marginTop: 8 }}>
        Treat Yourself (short-term): <Money value={treatBal} /> · Future
        (parked): <Money value={futureBal} /> · Saves in a row:{" "}
        {state.consecutiveSaves}/2
      </p>

      {mode === "choose" && (
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <PrimaryButton onClick={() => setMode("treat")}>
            Treat Yourself
          </PrimaryButton>
          {!forced && (
            <SecondaryButton onClick={() => setMode("save")}>
              Save for the Future
            </SecondaryButton>
          )}
          {forced && (
            <p className="tiny">
              You’ve saved twice in a row — Treat Yourself is required this
              time.
            </p>
          )}
        </div>
      )}

      {mode === "save" && (
        <div style={{ marginTop: 16 }}>
          <p className="muted">
            Keep this win parked for later. You are not spending your short-term
            Treat pool right now.
          </p>
          <PrimaryButton onClick={doSave} disabled={busy}>
            Save for the Future
          </PrimaryButton>
          <div style={{ marginTop: 8 }}>
            <SecondaryButton onClick={() => setMode("choose")}>
              Back
            </SecondaryButton>
          </div>
        </div>
      )}

      {mode === "treat" && (
        <div style={{ marginTop: 16 }}>
          <p className="muted">
            Pick a wishlist item. Pay from Treat Yourself first. If it costs
            more than Treat, you can pull the rest from Future.
          </p>
          <div className="choice-row">
            {eligible.map((r) => (
              <button
                key={r.id}
                type="button"
                className={rewardId === r.id ? "choice selected" : "choice"}
                onClick={() => {
                  setRewardId(r.id);
                  setNewName("");
                  setNewCost("");
                }}
              >
                {r.name} · <Money value={r.estimatedCost} />
              </button>
            ))}
          </div>
          <p className="eyebrow" style={{ marginTop: 14 }}>
            Or create one
          </p>
          <label className="field">
            <span className="field-label">Item</span>
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setRewardId("");
              }}
              placeholder="Massage, dinner…"
            />
          </label>
          <label className="field">
            <span className="field-label">Cost</span>
            <input
              type="number"
              value={newCost}
              onChange={(e) => {
                setNewCost(e.target.value);
                setRewardId("");
              }}
            />
          </label>
          <label className="field">
            <span className="field-label">Optional note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you rebuild?"
            />
          </label>
          {needsPull && (
            <label
              className="field"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginTop: 8,
              }}
            >
              <input
                type="checkbox"
                checked={pullFuture}
                onChange={(e) => setPullFuture(e.target.checked)}
                style={{ marginTop: 4 }}
              />
              <span className="tiny">
                Pull <Money value={deficit} /> from Future (you have{" "}
                <Money value={futureBal} /> parked)
              </span>
            </label>
          )}
          {needsPull && !pullFuture && (
            <p className="tiny" style={{ color: "var(--warn)" }}>
              Cost is above Treat — enable Future pull or pick a cheaper item.
            </p>
          )}
          <PrimaryButton
            onClick={doTreat}
            disabled={
              busy ||
              (!rewardId && (!newName.trim() || !newCost)) ||
              (needsPull && !pullFuture) ||
              (needsPull && pullFuture && deficit > futureBal)
            }
          >
            Confirm Treat Yourself
          </PrimaryButton>
          {!forced && (
            <div style={{ marginTop: 8 }}>
              <SecondaryButton onClick={() => setMode("choose")}>
                Back
              </SecondaryButton>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: "var(--danger)", marginTop: 12 }}>{error}</p>
      )}
    </section>
  );
}

export function FundSegmentBar({
  fund,
}: {
  fund: { future: number; treat: number; rebuild?: number };
}) {
  const future = (fund.future ?? 0) + (fund.rebuild ?? 0);
  const treat = fund.treat ?? 0;
  const total = fundTotal({ future, treat }) || 1;
  const segments = [
    {
      key: "future",
      label: "Future (parked)",
      value: future,
      color: "#5b8a7a",
    },
    {
      key: "treat",
      label: "Treat Yourself (short-term)",
      value: treat,
      color: "#d4a24a",
    },
  ];
  return (
    <div>
      <div className="segment-bar" aria-hidden>
        {segments.map((s) => (
          <div
            key={s.key}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: s.color,
            }}
            title={`${s.label}: $${s.value}`}
          />
        ))}
      </div>
      <div className="segment-legend">
        {segments.map((s) => (
          <div key={s.key} className="segment-item">
            <span
              className="segment-dot"
              style={{ background: s.color }}
            />
            <span>
              {s.key === "future" ? "Future" : "Treat"} ·{" "}
              <Money value={s.value} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function usePendingRewards() {
  const { state } = useApp();
  return pendingCashableMoments(state);
}
