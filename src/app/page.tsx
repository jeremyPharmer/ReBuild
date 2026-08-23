"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { RecoveryPodcastCard } from "@/components/RecoveryPodcastCard";
import { WeekPlanPanel } from "@/components/WeekPlanPanel";
import { FundSegmentBar, HomeRewardCard } from "@/components/MilestoneReward";
import { Money, PrimaryButton, SecondaryButton, Sheet } from "@/components/ui";
import {
  eligibleWishlistForIncentive,
  fundTotal,
  pendingCashableMoments,
  projectedTreatYourselfAt,
  splitTransfer,
} from "@/lib/fund";
import {
  addDays,
  assignedRewardForMilestone,
  nextIncentive,
  waitingReclaimDays,
} from "@/lib/journey";
import type { SupportType } from "@/lib/types";
import { truncateSupportLabel } from "@/lib/auth-constants";

function formatMd(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

type SkipKey = SupportType | "morning" | "evening";

type ExitingSupport = {
  type: SupportType;
  label: string;
  weekDone: number;
  weeklyTarget: number;
};

export default function HomePage() {
  const { state, dashboard, today, post } = useApp();
  const router = useRouter();
  const [busyType, setBusyType] = useState<SupportType | null>(null);
  const [skipBusy, setSkipBusy] = useState<SkipKey | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoBusy, setUndoBusy] = useState<string | null>(null);
  const [exiting, setExiting] = useState<ExitingSupport[]>([]);
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
  const treatAvailable = incentive
    ? projectedTreatYourselfAt(state, incentive.dayNumber, today)
    : 0;
  const eligibleRewards = incentive
    ? eligibleWishlistForIncentive(state, incentive.dayNumber, today)
    : [];
  const waiting = waitingReclaimDays(state);
  const pendingRewards = pendingCashableMoments(state);
  const total = fundTotal(state.fund);
  const treatSplit = state.profile.treatSplit;
  const waitingSplit = splitTransfer(dashboard.waiting, treatSplit);
  const partialNum = Number(partialAmount);
  const partialSplit = splitTransfer(
    Number.isFinite(partialNum) && partialNum > 0 ? partialNum : 0,
    treatSplit,
  );
  const enabledSupports = state.profile.supports.filter((s) => s.enabled);
  const completedSupportTypes = new Set(
    dashboard.todaySupports.map((t) => t.supportType),
  );
  const exitingTypes = new Set(exiting.map((e) => e.type));
  const openSupports = enabledSupports.filter(
    (s) =>
      !skips.has(s.type) &&
      !completedSupportTypes.has(s.type) &&
      !exitingTypes.has(s.type),
  );
  const todayProvisions = (state.dayProvisions ?? []).filter(
    (p) => p.date === today,
  );
  const openProvisions = todayProvisions.filter((p) => !p.completed);
  const completedProvisions = todayProvisions.filter((p) => p.completed);
  const morningSkipped = skips.has("morning");
  const eveningSkipped = skips.has("evening");
  const morningDone = Boolean(dashboard.todayMorning);
  const eveningDone = Boolean(dashboard.todayEvening);
  const showMorningOpen = !morningDone && !morningSkipped;
  const showEveningOpen = !eveningDone && !eveningSkipped;
  const openCount =
    (showMorningOpen ? 1 : 0) +
    openSupports.length +
    openProvisions.length +
    exiting.length +
    (showEveningOpen ? 1 : 0);

  const completedSupports = dashboard.todaySupports;
  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems =
    completedSupports.length > 0 ||
    completedProvisions.length > 0 ||
    skippedToday.length > 0 ||
    morningDone ||
    eveningDone;

  async function completeSupport(item: ExitingSupport) {
    setBusyType(item.type);
    setExiting((prev) =>
      prev.some((e) => e.type === item.type) ? prev : [...prev, item],
    );
    try {
      await Promise.all([
        post("/api/support", {
          date: today,
          supportType: item.type,
          completed: true,
        }),
        new Promise((r) => setTimeout(r, 700)),
      ]);
    } finally {
      setExiting((prev) => prev.filter((e) => e.type !== item.type));
      setBusyType(null);
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

  async function undoMorning() {
    setUndoBusy("morning");
    try {
      await post("/api/morning", { action: "undo", date: today });
    } finally {
      setUndoBusy(null);
    }
  }

  async function completeProvision(id: string) {
    setUndoBusy(`prov:${id}`);
    try {
      await post("/api/day-provision", {
        action: "complete",
        id,
        date: today,
      });
    } finally {
      setUndoBusy(null);
    }
  }

  async function undoProvision(id: string) {
    setUndoBusy(`prov:${id}`);
    try {
      await post("/api/day-provision", {
        action: "undo",
        id,
        date: today,
      });
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

  async function deletePickerReward(rewardId: string) {
    if (!window.confirm("Remove this reward from your list?")) return;
    setAssignBusy(true);
    setAssignError("");
    try {
      await post("/api/rewards", { action: "delete", id: rewardId });
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Could not delete");
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
  const incentiveDate =
    incentive && daysToIncentive >= 0
      ? formatMd(addDays(today, daysToIncentive))
      : null;

  return (
    <main className="fade-in stack">
      <header className="hero-day">
        <p className="eyebrow">REBUILD</p>
        <h1>{dashboard.label}</h1>
        <p className="muted">{dashboard.sinceLabel}</p>
      </header>

      {pendingRewards.map((m) => (
        <HomeRewardCard key={m.id} moment={m} onDone={() => undefined} />
      ))}

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
              Bring something back to today&apos;s list
            </p>
            {!hasUndoItems && (
              <p className="muted" style={{ margin: 0 }}>
                Nothing to undo yet.
              </p>
            )}
            {completedSupports.map((s) => (
              <div key={`done-${s.supportType}`} className="undo-row">
                <span>{supportLabel(s.supportType)} · done</span>
                <button
                  type="button"
                  className="dismiss-btn"
                  disabled={undoBusy === s.supportType}
                  onClick={() => undoSupport(s.supportType)}
                >
                  Undo
                </button>
              </div>
            ))}
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
            {completedProvisions.map((p) => (
              <div key={`prov-done-${p.id}`} className="undo-row">
                <span>{p.label} · done</span>
                <button
                  type="button"
                  className="dismiss-btn"
                  disabled={undoBusy === `prov:${p.id}`}
                  onClick={() => undoProvision(p.id)}
                >
                  Undo
                </button>
              </div>
            ))}
            {morningDone && (
              <div className="undo-row">
                <span>Start the day · done</span>
                <button
                  type="button"
                  className="dismiss-btn"
                  disabled={undoBusy === "morning"}
                  onClick={() => undoMorning()}
                >
                  Undo
                </button>
              </div>
            )}
            {eveningDone && (
              <p className="tiny">Evening check-in is logged for today.</p>
            )}
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

          {enabledSupports.map((s) => {
            if (skips.has(s.type)) return null;
            const isExiting = exitingTypes.has(s.type);
            const isDone =
              completedSupportTypes.has(s.type) && !isExiting;
            if (isDone) return null;

            const weekDone =
              dashboard.week.find((w) => w.type === s.type)?.done ?? 0;
            const exitingItem = exiting.find((e) => e.type === s.type);

            if (isExiting && exitingItem) {
              return (
                <div
                  key={s.type}
                  className="check-item check-item-row clearing"
                  aria-live="polite"
                >
                  <div className="check-item-main" aria-hidden>
                    <span className="check-box checked">✓</span>
                    <span className="check-label">
                      <span className="check-label-name">
                        {truncateSupportLabel(exitingItem.label)}
                      </span>
                      <span className="check-label-meta">
                        · {exitingItem.weekDone + 1}/{exitingItem.weeklyTarget}
                      </span>
                    </span>
                  </div>
                  <span className="clear-burst" aria-hidden>
                    +1
                  </span>
                </div>
              );
            }

            return (
              <div key={s.type} className="check-item check-item-row">
                <button
                  type="button"
                  className="check-item-main"
                  disabled={busyType === s.type}
                  onClick={() =>
                    completeSupport({
                      type: s.type,
                      label: s.label,
                      weekDone,
                      weeklyTarget: s.weeklyTarget,
                    })
                  }
                >
                  <span className="check-box" />
                  <span className="check-label">
                    <span className="check-label-name">
                      {truncateSupportLabel(s.label)}
                    </span>
                    <span className="check-label-meta">
                      · {weekDone}/{s.weeklyTarget}
                    </span>
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

          {openProvisions.map((p) => (
            <div key={p.id} className="check-item check-item-row">
              <button
                type="button"
                className="check-item-main"
                disabled={undoBusy === `prov:${p.id}`}
                onClick={() => completeProvision(p.id)}
              >
                <span className="check-box" />
                <span className="check-label">{p.label}</span>
              </button>
            </div>
          ))}

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

          {openCount === 0 && (
            <p className="muted" style={{ marginTop: 4 }}>
              Today&apos;s list is clear. Nice work.
            </p>
          )}
        </div>
      </section>

      <RecoveryPodcastCard />

      <section className="panel">
        <div className="row">
          <div>
            <p className="eyebrow">Total</p>
            <p className="money money-xl">
              <Money value={total} />
            </p>
            <p className="tiny">Future · Treat Yourself</p>
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
              Move waiting money
            </PrimaryButton>
          </div>
        )}

        {waiting.length > 0 && reclaimStep === "choose" && (
          <div className="reclaim-chooser" style={{ marginTop: 14 }}>
            <p className="tiny" style={{ marginBottom: 10 }}>
              Move <Money value={dashboard.waiting} /> from waiting — 30% Future
              · 70% Treat Yourself (
              <Money value={waitingSplit.future} /> ·{" "}
              <Money value={waitingSplit.treat} />)
            </p>
            <div className="choice-row">
              <button
                type="button"
                className="choice"
                disabled={reclaimBusy}
                onClick={() => confirmReclaim(dashboard.waiting)}
              >
                All · ${dashboard.waiting}
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
              How much of the ${dashboard.waiting} waiting? Splits 30% Future ·
              70% Treat Yourself.
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
            {Number.isFinite(partialNum) && partialNum > 0 && (
              <p className="tiny" style={{ marginBottom: 8 }}>
                <Money value={partialSplit.future} /> Future ·{" "}
                <Money value={partialSplit.treat} /> Treat Yourself
              </p>
            )}
            <PrimaryButton
              disabled={
                reclaimBusy ||
                !Number.isFinite(partialNum) ||
                partialNum < 0
              }
              onClick={() => confirmReclaim(partialNum)}
            >
              {reclaimBusy
                ? "Moving…"
                : `Move $${partialNum || 0}`}
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
          <div className="incentive-head">
            <div className="incentive-head-main">
              <p className="eyebrow">Next incentive</p>
              <h2>
                Day {incentive.dayNumber} · {incentive.title}
              </h2>
              <p className="muted" style={{ marginTop: 6 }}>
                {daysToIncentive} day{daysToIncentive === 1 ? "" : "s"} away
                {incentiveDate ? ` · ${incentiveDate}` : ""}
              </p>
            </div>
            <div className="incentive-treat">
              <p className="incentive-treat-amount">
                <Money value={treatAvailable} />
              </p>
              <p className="incentive-treat-label">to treat yourself</p>
            </div>
          </div>

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

      <WeekPlanPanel today={today} week={dashboard.week} />

      {rewardPickerOpen && incentive && (
        <Sheet
          label="Choose reward"
          busy={assignBusy}
          onClose={() => setRewardPickerOpen(false)}
        >
            <p className="eyebrow">Day {incentive.dayNumber}</p>
            <h2>Choose reward</h2>
            <p className="tiny" style={{ marginTop: 6, marginBottom: 12 }}>
              Showing wishlist items up to{" "}
              <Money value={treatAvailable} /> you&apos;ll have by this date.
            </p>

            {eligibleRewards.length === 0 ? (
              <p className="muted" style={{ lineHeight: 1.45 }}>
                No matching rewards yet. Add one on the Rewards tab at or under{" "}
                <Money value={treatAvailable} />.
              </p>
            ) : (
              <div className="reward-pick-list">
                {eligibleRewards.map((r) => {
                  const selected = assigned?.id === r.id;
                  return (
                    <div key={r.id} className="reward-pick-row">
                      <button
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
                      <button
                        type="button"
                        className="reward-pick-delete"
                        disabled={assignBusy}
                        onClick={() => deletePickerReward(r.id)}
                      >
                        Delete
                      </button>
                    </div>
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
        </Sheet>
      )}

      <Link href="/craving">
        <SecondaryButton>I&apos;m having a craving</SecondaryButton>
      </Link>
    </main>
  );
}
