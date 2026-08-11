"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { FundSegmentBar } from "@/components/MilestoneReward";
import { Money, PrimaryButton, SecondaryButton } from "@/components/ui";
import { fundTotal, pendingCashableMoments } from "@/lib/fund";
import {
  assignedRewardForMilestone,
  nextIncentive,
  suggestedRewardPool,
  waitingReclaimDays,
} from "@/lib/journey";
import type { SupportType } from "@/lib/types";

type SkipKey = SupportType | "morning" | "evening";

export default function HomePage() {
  const { state, dashboard, today, post } = useApp();
  const router = useRouter();
  const [busyType, setBusyType] = useState<SupportType | null>(null);
  const [skipBusy, setSkipBusy] = useState<SkipKey | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoBusy, setUndoBusy] = useState<string | null>(null);
  const [justDone, setJustDone] = useState<SupportType | null>(null);
  const [reclaimStep, setReclaimStep] = useState<"idle" | "choose" | "partial">(
    "idle",
  );
  const [partialAmount, setPartialAmount] = useState("");
  const [reclaimBusy, setReclaimBusy] = useState(false);
  const [reclaimError, setReclaimError] = useState("");
  const [rewardPickerOpen, setRewardPickerOpen] = useState(false);
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  if (!state.profile?.onboarded || !dashboard) {
    return null;
  }

  const skips = new Set(dashboard.todaySkips ?? []);
  const incentive = nextIncentive(dashboard.cleanDays);
  const assigned = incentive
    ? assignedRewardForMilestone(state, incentive.dayNumber)
    : undefined;
  const pool = incentive
    ? suggestedRewardPool(
        incentive.dayNumber,
        state.profile.historicalDailySpend,
      )
    : 0;
  const eligibleRewards = state.rewards.filter(
    (r) => !r.executed && r.estimatedCost <= pool,
  );
  const waiting = waitingReclaimDays(state);
  const pendingRewards = pendingCashableMoments(state);
  const total = fundTotal(state.fund);
  const enabledSupports = state.profile.supports.filter((s) => s.enabled);
  const completedSupportTypes = new Set(
    dashboard.todaySupports.map((t) => t.supportType),
  );
  const openSupports = enabledSupports.filter(
    (s) => !skips.has(s.type) && !completedSupportTypes.has(s.type),
  );
  const morningSkipped = skips.has("morning");
  const eveningSkipped = skips.has("evening");
  const morningDone = Boolean(dashboard.todayMorning);
  const eveningDone = Boolean(dashboard.todayEvening);
  const showMorningOpen = !morningDone && !morningSkipped;
  const showEveningOpen = !eveningDone && !eveningSkipped;
  const openCount =
    (showMorningOpen ? 1 : 0) + openSupports.length + (showEveningOpen ? 1 : 0);

  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems = skippedToday.length > 0;

  async function completeSupport(type: SupportType) {
    setBusyType(type);
    setJustDone(type);
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: true,
      });
    } finally {
      setBusyType(null);
      window.setTimeout(() => {
        setJustDone((cur) => (cur === type ? null : cur));
      }, 400);
    }
  }

  async function dismissItem(itemKey: SkipKey) {
    setSkipBusy(itemKey);
    try {
      await post("/api/skip", { date: today, itemKey });
    } finally {
      setSkipBusy(null);
    }
  }

  async function undoSupport(type: SupportType) {
    setUndoBusy(type);
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: false,
      });
    } finally {
      setUndoBusy(null);
    }
  }

  async function undoSkip(itemKey: SkipKey) {
    setUndoBusy(`skip:${itemKey}`);
    try {
      await post("/api/skip", { date: today, itemKey, clear: true });
    } finally {
      setUndoBusy(null);
    }
  }

  async function confirmReclaim(amount: number) {
    if (!Number.isFinite(amount) || amount < 0 || waiting.length === 0) return;
    setReclaimBusy(true);
    setReclaimError("");
    try {
      await post("/api/reclaim", {
        dayDates: waiting.map((d) => d.date),
        amount,
      });
      setReclaimStep("idle");
      setPartialAmount("");
    } catch (e) {
      setReclaimError(e instanceof Error ? e.message : "Could not move");
    } finally {
      setReclaimBusy(false);
    }
  }

  function openReclaim() {
    setReclaimError("");
    setPartialAmount(String(dashboard?.waiting ?? ""));
    setReclaimStep("choose");
  }

  function cancelReclaim() {
    setReclaimStep("idle");
    setPartialAmount("");
    setReclaimError("");
  }

  async function assignReward(rewardId: string) {
    if (!incentive) return;
    setAssignBusy(true);
    setAssignError("");
    const clearing = assigned?.id === rewardId;
    try {
      await post("/api/rewards", {
        action: "assign",
        id: rewardId,
        milestoneDay: incentive.dayNumber,
        ...(clearing ? { clear: true } : {}),
      });
      setRewardPickerOpen(false);
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Could not assign");
    } finally {
      setAssignBusy(false);
    }
  }

  function supportLabel(type: string) {
    return (
      state.profile?.supports.find((s) => s.type === type)?.label ?? type
    );
  }

  function itemLabel(key: string) {
    if (key === "morning") return "Start the day";
    if (key === "evening") return "Close the day";
    return supportLabel(key);
  }

  const daysToIncentive = incentive
    ? incentive.dayNumber - dashboard.cleanDays
    : 0;

  return (
    <main className="fade-in stack">
      <header className="hero-day">
        <p className="eyebrow">REBUILD</p>
        <h1>{dashboard.label}</h1>
        <p className="muted">{dashboard.sinceLabel}</p>
      </header>

      {pendingRewards.length > 0 && (
        <section className="panel">
          <p className="eyebrow">Decision waiting</p>
          <h2>
            Day {pendingRewards[0].dayNumber} · {pendingRewards[0].title}
          </h2>
          <p className="muted">
            {total > 0
              ? "Treat Yourself or Save for the Future."
              : "Move money to Rebuild first, then Treat or Save."}
          </p>
          <div style={{ marginTop: 12 }}>
            <Link href={total > 0 ? "/evening" : "/money"}>
              <PrimaryButton>
                {total > 0 ? "Open reward moment" : "Move money to Rebuild"}
              </PrimaryButton>
            </Link>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="row">
          <p className="eyebrow" style={{ marginBottom: 0 }}>
            Today&apos;s Rebuild
          </p>
          <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
            <span className="chip">
              {openCount === 0 ? "Clear for today" : `${openCount} left`}
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Undo today's items"
              aria-expanded={undoOpen}
              onClick={() => setUndoOpen((v) => !v)}
            >
              ⋯
            </button>
          </div>
        </div>

        {undoOpen && (
          <div className="undo-panel">
            <p className="tiny" style={{ marginBottom: 8 }}>
              Bring a &ldquo;Not today&rdquo; item back
            </p>
            {!hasUndoItems && (
              <p className="muted" style={{ margin: 0 }}>
                Nothing skipped yet.
              </p>
            )}
            {skippedToday.map((s) => (
              <div key={`skip-${s.itemKey}`} className="undo-row">
                <span>{itemLabel(s.itemKey)} · not today</span>
                <button
                  type="button"
                  className="dismiss-btn"
                  disabled={undoBusy === `skip:${s.itemKey}`}
                  onClick={() => undoSkip(s.itemKey)}
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="daily-actions" style={{ marginTop: 10 }}>
          {showMorningOpen && (
            <div className="check-item check-item-row">
              <Link href="/morning" className="check-item-main">
                <span className="check-box" />
                <span className="check-label">Start the day</span>
              </Link>
              <button
                type="button"
                className="dismiss-btn"
                disabled={skipBusy === "morning"}
                onClick={() => dismissItem("morning")}
              >
                Not today
              </button>
            </div>
          )}
          {morningDone && !morningSkipped && (
            <div className="check-item check-item-row done">
              <div className="check-item-main" aria-label="Start the day done">
                <span className="check-box checked">✓</span>
                <span className="check-label">Start the day</span>
              </div>
            </div>
          )}

          {enabledSupports.map((s) => {
            if (skips.has(s.type)) return null;
            const weekDone =
              dashboard.week.find((w) => w.type === s.type)?.done ?? 0;
            const isDone = completedSupportTypes.has(s.type);
            if (isDone) {
              return (
                <div
                  key={s.type}
                  className={`check-item check-item-row done${
                    justDone === s.type ? " just-done" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="check-item-main"
                    disabled={undoBusy === s.type}
                    onClick={() => undoSupport(s.type)}
                    aria-label={`Undo ${s.label}`}
                  >
                    <span className="check-box checked">✓</span>
                    <span className="check-label">
                      {s.label}, week {weekDone} of {s.weeklyTarget}
                    </span>
                  </button>
                </div>
              );
            }
            return (
              <div key={s.type} className="check-item check-item-row">
                <button
                  type="button"
                  className="check-item-main"
                  disabled={busyType === s.type}
                  onClick={() => completeSupport(s.type)}
                >
                  <span className="check-box" />
                  <span className="check-label">
                    {s.label}, week {weekDone} of {s.weeklyTarget}
                  </span>
                </button>
                <button
                  type="button"
                  className="dismiss-btn"
                  disabled={skipBusy === s.type}
                  onClick={() => dismissItem(s.type)}
                >
                  Not today
                </button>
              </div>
            );
          })}

          {showEveningOpen && (
            <div className="check-item check-item-row">
              <Link href="/evening" className="check-item-main">
                <span className="check-box" />
                <span className="check-label">Close the day</span>
              </Link>
              <button
                type="button"
                className="dismiss-btn"
                disabled={skipBusy === "evening"}
                onClick={() => dismissItem("evening")}
              >
                Not today
              </button>
            </div>
          )}
          {eveningDone && !eveningSkipped && (
            <div className="check-item check-item-row done">
              <div className="check-item-main" aria-label="Close the day done">
                <span className="check-box checked">✓</span>
                <span className="check-label">Close the day</span>
              </div>
            </div>
          )}

          {openCount === 0 && (
            <p className="muted" style={{ marginTop: 4 }}>
              Today&apos;s list is clear. Nice work.
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="row">
          <div>
            <p className="eyebrow">Total</p>
            <p className="money money-xl">
              <Money value={total} />
            </p>
            <p className="tiny">Already in Rebuild</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="tiny">Waiting to reclaim</p>
            <p className="money" style={{ fontSize: "1.4rem" }}>
              <Money value={dashboard.waiting} />
            </p>
            <p className="tiny">{dashboard.waitingDays} days</p>
          </div>
        </div>
        <FundSegmentBar fund={state.fund} />

        {waiting.length > 0 && reclaimStep === "idle" && (
          <div style={{ marginTop: 14 }}>
            <PrimaryButton onClick={openReclaim}>
              Move to Rebuild
            </PrimaryButton>
          </div>
        )}

        {waiting.length > 0 && reclaimStep === "choose" && (
          <div className="reclaim-chooser" style={{ marginTop: 14 }}>
            <p className="tiny" style={{ marginBottom: 10 }}>
              Move <Money value={dashboard.waiting} /> from waiting into Total
            </p>
            <div className="choice-row">
              <button
                type="button"
                className="choice"
                disabled={reclaimBusy}
                onClick={() => confirmReclaim(dashboard.waiting)}
              >
                Total · ${dashboard.waiting}
              </button>
              <button
                type="button"
                className="choice"
                disabled={reclaimBusy}
                onClick={() => setReclaimStep("partial")}
              >
                Partial
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              <SecondaryButton onClick={cancelReclaim}>Cancel</SecondaryButton>
            </div>
          </div>
        )}

        {waiting.length > 0 && reclaimStep === "partial" && (
          <div className="reclaim-chooser" style={{ marginTop: 14 }}>
            <p className="tiny" style={{ marginBottom: 8 }}>
              How much of the ${dashboard.waiting} waiting are you moving?
            </p>
            <label className="field">
              <span className="field-label">Amount</span>
              <input
                type="number"
                min={0}
                max={dashboard.waiting}
                step="1"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
              />
            </label>
            <PrimaryButton
              disabled={
                reclaimBusy ||
                !Number.isFinite(Number(partialAmount)) ||
                Number(partialAmount) < 0
              }
              onClick={() => confirmReclaim(Number(partialAmount))}
            >
              {reclaimBusy
                ? "Moving…"
                : `Move $${Number(partialAmount) || 0} to Rebuild`}
            </PrimaryButton>
            <div style={{ marginTop: 8 }}>
              <SecondaryButton
                onClick={() => {
                  setReclaimStep("choose");
                  setReclaimError("");
                }}
              >
                Back
              </SecondaryButton>
            </div>
          </div>
        )}

        {reclaimError && (
          <p style={{ color: "var(--danger)", marginTop: 8 }}>{reclaimError}</p>
        )}
      </section>

      {incentive && (
        <section className="panel">
          <p className="eyebrow">Next incentive</p>
          <h2>
            Day {incentive.dayNumber} · {incentive.title}
          </h2>
          <p className="muted" style={{ marginTop: 6 }}>
            {daysToIncentive} day{daysToIncentive === 1 ? "" : "s"} away
          </p>

          {assigned ? (
            <div className="incentive-reward" style={{ marginTop: 14 }}>
              <p className="tiny">Working toward</p>
              <p style={{ margin: "4px 0 0", fontWeight: 650, fontSize: "1.1rem" }}>
                {assigned.name}
              </p>
              <p className="tiny" style={{ marginTop: 4 }}>
                {assigned.category} · <Money value={assigned.estimatedCost} />
              </p>
              <div style={{ marginTop: 12 }}>
                <SecondaryButton
                  onClick={() => {
                    setAssignError("");
                    setRewardPickerOpen(true);
                  }}
                >
                  Change reward
                </SecondaryButton>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <p className="muted" style={{ marginBottom: 12, lineHeight: 1.45 }}>
                Choose what {incentive.title} is for — something you can reach
                with this incentive.
              </p>
              <PrimaryButton
                onClick={() => {
                  setAssignError("");
                  setRewardPickerOpen(true);
                }}
              >
                Choose reward
              </PrimaryButton>
            </div>
          )}
        </section>
      )}

      {rewardPickerOpen && incentive && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !assignBusy && setRewardPickerOpen(false)}
        >
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Choose reward"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Day {incentive.dayNumber}</p>
            <h2>Choose reward</h2>
            <p className="tiny" style={{ marginTop: 6, marginBottom: 12 }}>
              Showing wishlist items up to <Money value={pool} /> for this
              incentive.
            </p>

            {eligibleRewards.length === 0 ? (
              <p className="muted" style={{ lineHeight: 1.45 }}>
                No matching rewards yet. Add one on the Rewards tab at or under{" "}
                <Money value={pool} />.
              </p>
            ) : (
              <div className="reward-pick-list">
                {eligibleRewards.map((r) => {
                  const selected = assigned?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={
                        selected
                          ? "check-item check-item-row done"
                          : "check-item check-item-row"
                      }
                      disabled={assignBusy}
                      onClick={() => assignReward(r.id)}
                    >
                      <span className="check-box">
                        {selected ? "✓" : ""}
                      </span>
                      <span className="check-label">
                        {r.name}
                        {r.assignedMilestoneDay &&
                        r.assignedMilestoneDay !== incentive.dayNumber
                          ? ` · Day ${r.assignedMilestoneDay}`
                          : ""}
                      </span>
                      <span className="tiny">
                        <Money value={r.estimatedCost} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {assignError && (
              <p style={{ color: "var(--danger)", marginTop: 10 }}>
                {assignError}
              </p>
            )}

            <div className="grid-2" style={{ marginTop: 14 }}>
              <Link href="/money" onClick={() => setRewardPickerOpen(false)}>
                <SecondaryButton>Open Rewards</SecondaryButton>
              </Link>
              <SecondaryButton
                onClick={() => setRewardPickerOpen(false)}
                disabled={assignBusy}
              >
                Close
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      <Link href="/craving">
        <SecondaryButton>I&apos;m having a craving</SecondaryButton>
      </Link>
    </main>
  );
}
