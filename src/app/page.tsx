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
  projectedReclaimAt,
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

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  if (!state.profile?.onboarded || !dashboard) {
    return null;
  }

  const skips = new Set(dashboard.todaySkips ?? []);
  const next = dashboard.next[0];
  const then = dashboard.next[1];
  const horizon = dashboard.next[2];
  const assigned = next
    ? assignedRewardForMilestone(state, next.dayNumber)
    : undefined;
  const projected = next ? projectedReclaimAt(state, next.dayNumber, today) : 0;
  const pool = next
    ? suggestedRewardPool(next.dayNumber, state.profile.historicalDailySpend)
    : 0;
  const waiting = waitingReclaimDays(state);
  const pendingRewards = pendingCashableMoments(state);
  const total = fundTotal(state.fund);
  const enabledSupports = state.profile.supports.filter((s) => s.enabled);
  const openSupports = enabledSupports.filter(
    (s) =>
      !skips.has(s.type) &&
      !dashboard.todaySupports.some((t) => t.supportType === s.type),
  );
  const showMorning = !dashboard.todayMorning && !skips.has("morning");
  const showEvening = !dashboard.todayEvening && !skips.has("evening");
  const openCount =
    (showMorning ? 1 : 0) + openSupports.length + (showEvening ? 1 : 0);

  const completedSupports = dashboard.todaySupports;
  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems =
    completedSupports.length > 0 ||
    skippedToday.length > 0 ||
    Boolean(dashboard.todayMorning) ||
    Boolean(dashboard.todayEvening);

  async function completeSupport(type: SupportType) {
    setBusyType(type);
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: true,
      });
    } finally {
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
          <p className="muted">Treat Yourself or Save & compound.</p>
          <div style={{ marginTop: 12 }}>
            <Link href="/evening">
              <PrimaryButton>Open reward moment</PrimaryButton>
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
            {dashboard.todayMorning && (
              <p className="tiny">Morning check-in is logged for today.</p>
            )}
            {dashboard.todayEvening && (
              <p className="tiny">Evening check-in is logged for today.</p>
            )}
          </div>
        )}

        <div className="daily-actions" style={{ marginTop: 10 }}>
          {showMorning && (
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

          {openSupports.map((s) => {
            const weekDone =
              dashboard.week.find((w) => w.type === s.type)?.done ?? 0;
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

          {showEvening && (
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

      <section className="panel">
        <div className="row">
          <div>
            <p className="eyebrow">Total</p>
            <p className="money money-xl">
              <Money value={total} />
            </p>
            <p className="tiny">Future + Rebuild + Treat</p>
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
        {waiting.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <Link href="/money">
              <PrimaryButton>
                Move ${dashboard.waiting} to Rebuild
              </PrimaryButton>
            </Link>
          </div>
        )}
      </section>

      {next && (
        <section className="panel">
          <p className="eyebrow">Next up</p>
          <h2>
            Day {next.dayNumber} · {next.title}
          </h2>
          <p className="muted" style={{ marginTop: 6 }}>
            {next.dayNumber - dashboard.cleanDays} day
            {next.dayNumber - dashboard.cleanDays === 1 ? "" : "s"} away ·{" "}
            {next.type}
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <p className="tiny">Projected / suggested pool</p>
              <p className="money" style={{ fontSize: "1.35rem" }}>
                <Money value={projected || pool} />
              </p>
            </div>
            {assigned && (
              <div style={{ textAlign: "right" }}>
                <p className="tiny">My reward</p>
                <p style={{ fontWeight: 600 }}>{assigned.name}</p>
              </div>
            )}
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            {then && (
              <p className="tiny">
                Then · Day {then.dayNumber} — {then.title}
              </p>
            )}
            {horizon && (
              <p className="tiny">
                On the horizon · Day {horizon.dayNumber} — {horizon.title}
              </p>
            )}
          </div>
        </section>
      )}

      <Link href="/craving">
        <SecondaryButton>I&apos;m having a craving</SecondaryButton>
      </Link>
    </main>
  );
}
