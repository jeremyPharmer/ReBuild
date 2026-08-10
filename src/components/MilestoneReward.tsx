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
import { suggestedRewardPool } from "@/lib/journey";
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
  const suggested = suggestedRewardPool(
    moment.dayNumber,
    state.profile?.historicalDailySpend ?? 0,
  );
  const [mode, setMode] = useState<"choose" | "save" | "treat">(
    forced ? "treat" : "choose",
  );
  const [saveAmount, setSaveAmount] = useState(String(suggested));
  const [rewardId, setRewardId] = useState("");
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneMsg, setDoneMsg] = useState("");

  const eligible = useMemo(() => eligibleWishlist(state), [state]);

  async function doSave() {
    setBusy(true);
    setError("");
    try {
      await post("/api/milestone-reward", {
        action: "save",
        milestoneAchievementId: moment.id,
        amount: Number(saveAmount),
      });
      setDoneMsg(`Saved $${saveAmount} into Treat Yourself.`);
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
        Treat pool now: <Money value={state.fund.treat} /> · Saves in a row:{" "}
        {state.consecutiveSaves}/2
      </p>

      {mode === "choose" && (
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <PrimaryButton onClick={() => setMode("treat")}>
            Treat Yourself
          </PrimaryButton>
          {!forced && (
            <SecondaryButton onClick={() => setMode("save")}>
              Save & compound
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
            Suggested Save based on day × daily spend curve. Edit if you want.
            Unmoved remainder stays in Future/Rebuild — not Treat.
          </p>
          <label className="field">
            <span className="field-label">
              Save into Treat Yourself (suggested ${suggested})
            </span>
            <input
              type="number"
              min={1}
              value={saveAmount}
              onChange={(e) => setSaveAmount(e.target.value)}
            />
          </label>
          <PrimaryButton onClick={doSave} disabled={busy}>
            Save ${saveAmount} into Treat Yourself
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
            Pick a wishlist item you can afford (Treat pool ≥ cost), or add one
            now.
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
          {newCost && Number(newCost) > state.fund.treat && (
            <p className="tiny" style={{ color: "var(--warn)" }}>
              Cost is above Treat pool — add it to wishlist only after lowering
              cost, or Save more first. Claim blocked until pool ≥ cost.
            </p>
          )}
          <PrimaryButton
            onClick={doTreat}
            disabled={
              busy ||
              (!rewardId &&
                (!newName.trim() ||
                  !newCost ||
                  Number(newCost) > state.fund.treat))
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
  fund: { future: number; rebuild: number; treat: number };
}) {
  const total = fundTotal(fund) || 1;
  const segments = [
    { key: "future", label: "Future 50%", value: fund.future, color: "#5b8a7a" },
    {
      key: "rebuild",
      label: "Rebuild 25%",
      value: fund.rebuild,
      color: "#c4784a",
    },
    {
      key: "treat",
      label: "Treat Yourself 25%",
      value: fund.treat,
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
              {s.label.split(" ")[0]} · <Money value={s.value} />
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
