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
  nextIncentives,
  projectedReclaimAt,
  suggestedRewardPool,
  waitingReclaimDays,
} from "@/lib/journey";
import type { SupportType } from "@/lib/types";

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

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  if (!state.profile?.onboarded || !dashboard) {
    return null;
  }

  const skips = new Set(dashboard.todaySkips ?? []);
  const incentive = nextIncentive(dashboard.cleanDays);
  const laterIncentives = nextIncentives(dashboard.cleanDays, 3).slice(1);
  const assigned = incentive
    ? assignedRewardForMilestone(state, incentive.dayNumber)
    : undefined;
  const projected = incentive
    ? projectedReclaimAt(state, incentive.dayNumber, today)
    : 0;
  const pool = incentive
    ? suggestedRewardPool(
        incentive.dayNumber,
        state.profile.historicalDailySpend,
      )
    : 0;
  const waiting = waitingReclaimDays(state);
  const pendingRewards = pendingCashableMoments(state);
  const total = fundTotal(state.fund);
  const dailySpend = state.profile.historicalDailySpend;
  const enabledSupports = state.profile.supports.filter((s) => s.enabled);
  const exitingTypes = new Set(exiting.map((e) => e.type));
  const openSupports = enabledSupports.filter(
    (s) =>
      !skips.has(s.type) &&
      !exitingTypes.has(s.type) &&
      !dashboard.todaySupports.some((t) => t.supportType === s.type),
  );
  const showMorning = !dashboard.todayMorning && !skips.has("morning");
  const showEvening = !dashboard.todayEvening && !skips.has("evening");
  const openCount =
    (showMorning ? 1 : 0) +
    openSupports.length +
    exiting.length +
    (showEvening ? 1 : 0);

  const completedSupports = dashboard.todaySupports;
  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems =
    completedSupports.length > 0 ||
    skippedToday.length > 0 ||
    Boolean(dashboard.todayMorning) ||
    Boolean(dashboard.todayEvening);

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

          {exiting.map((s) => (
            <div
              key={`exit-${s.type}`}
              className="check-item check-item-row clearing"
              aria-live="polite"
            >
              <div className="check-item-main" aria-hidden>
                <span className="check-box checked">✓</span>
                <span className="check-label">
                  {s.label}, week {s.weekDone + 1} of {s.weeklyTarget}
                </span>
              </div>
              <span className="clear-burst" aria-hidden>
                +1
              </span>
            </div>
          ))}

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
            <p className="tiny">Already in Rebuild (Venmo set aside)</p>
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
        {waiting.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <Link href="/money">
              <PrimaryButton>
                Move ${dashboard.waiting} to Rebuild
              </PrimaryButton>
            </Link>
          </div>
        ) : (
          <p className="tiny" style={{ marginTop: 12, lineHeight: 1.45 }}>
            Close an aligned day to earn ~${dailySpend} in waiting. Total
            grows after you Move to Rebuild — not at the start of the day.
          </p>
        )}
      </section>

      {incentive && (
        <section className="panel">
          <p className="eyebrow">Next incentive</p>
          <h2>
            Day {incentive.dayNumber} · {incentive.title}
          </h2>
          <p className="muted" style={{ marginTop: 6 }}>
            {daysToIncentive} day{daysToIncentive === 1 ? "" : "s"} away · Treat
            or Save
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <p className="tiny">Projected pool</p>
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
          {laterIncentives.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
              {laterIncentives.map((m, i) => (
                <p key={m.dayNumber} className="tiny">
                  {i === 0 ? "Then" : "Later"} · Day {m.dayNumber} — {m.title}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      <Link href="/craving">
        <SecondaryButton>I&apos;m having a craving</SecondaryButton>
      </Link>
    </main>
  );
}
