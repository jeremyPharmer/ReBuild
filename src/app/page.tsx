"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { FundSegmentBar } from "@/components/MilestoneReward";
import { Money, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/ui";
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
  const [contentPrompt, setContentPrompt] = useState(false);
  const [contentNote, setContentNote] = useState("");

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
  const pendingBonus = state.weeklyBonuses.find((b) => !b.confirmed);
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

  async function toggleSupport(type: SupportType, done: boolean) {
    if (type === "recovery_content" && !done) {
      setContentPrompt(true);
      return;
    }
    setBusyType(type);
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: !done,
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

  async function confirmContent() {
    setBusyType("recovery_content");
    try {
      await post("/api/support", {
        date: today,
        supportType: "recovery_content",
        completed: true,
        actionNote: contentNote || undefined,
      });
      setContentPrompt(false);
      setContentNote("");
    } finally {
      setBusyType(null);
    }
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
          <p className="muted">
            {total > 0
              ? "Treat Yourself or Save & compound."
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
          <p className="eyebrow">Today&apos;s Rebuild</p>
          <span className="chip">
            {openCount === 0 ? "Clear for today" : `${openCount} left`}
          </span>
        </div>
        <p className="tiny" style={{ marginBottom: 10 }}>
          Weekly targets: content 2 · meditation 5 · medication 7 · gym 4
        </p>
        <div className="daily-actions">
          {showMorning && (
            <div className="check-item check-item-row">
              <Link href="/morning" className="check-item-main">
                <span className="check-box" />
                <div>
                  <strong>Start the day</strong>
                  <p className="tiny">Morning check-in · 2–4 min</p>
                </div>
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
          {dashboard.todayMorning && (
            <div className="check-item done">
              <span className="check-box">✓</span>
              <div>
                <strong>Morning complete</strong>
                <p className="tiny">
                  Intention: {dashboard.todayMorning.intention || "—"}
                </p>
              </div>
            </div>
          )}

          {enabledSupports.map((s) => {
            const done = dashboard.todaySupports.some(
              (t) => t.supportType === s.type,
            );
            if (skips.has(s.type) && !done) return null;
            const week = dashboard.week.find((w) => w.type === s.type);
            if (done) {
              return (
                <button
                  key={s.type}
                  type="button"
                  className="check-item done"
                  disabled={busyType === s.type}
                  onClick={() => toggleSupport(s.type, done)}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <span className="check-box">✓</span>
                  <div style={{ flex: 1 }}>
                    <strong>{s.label}</strong>
                    <p className="tiny">
                      Today: done · Week {week?.done ?? 0}/
                      {week?.target ?? s.weeklyTarget}
                    </p>
                  </div>
                </button>
              );
            }
            return (
              <div key={s.type} className="check-item check-item-row">
                <button
                  type="button"
                  className="check-item-main"
                  disabled={busyType === s.type}
                  onClick={() => toggleSupport(s.type, done)}
                >
                  <span className="check-box" />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <strong>{s.label}</strong>
                    <p className="tiny">
                      Today: tap to log · Week {week?.done ?? 0}/
                      {week?.target ?? s.weeklyTarget}
                    </p>
                  </div>
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
                <div>
                  <strong>Close the day</strong>
                  <p className="tiny">Evening · ~30–60 sec + one line</p>
                </div>
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
          {dashboard.todayEvening && (
            <div className="check-item done">
              <span className="check-box">✓</span>
              <div>
                <strong>Evening complete</strong>
                <p className="tiny">{dashboard.todayEvening.oneLine}</p>
              </div>
            </div>
          )}

          {openCount === 0 &&
            !dashboard.todayMorning &&
            !dashboard.todayEvening &&
            dashboard.todaySupports.length === 0 && (
              <p className="muted" style={{ marginTop: 4 }}>
                Nothing left on today&apos;s list. Nice work clearing the board.
              </p>
            )}
        </div>

        {contentPrompt && (
          <div style={{ marginTop: 14 }}>
            <p className="eyebrow">Recovery content</p>
            <label className="field">
              <span className="field-label">
                What will you do differently because of this?
              </span>
              <input
                value={contentNote}
                onChange={(e) => setContentNote(e.target.value)}
                placeholder="One short action"
              />
            </label>
            <PrimaryButton
              onClick={confirmContent}
              disabled={busyType === "recovery_content"}
            >
              Log content
            </PrimaryButton>
            <div style={{ marginTop: 8 }}>
              <SecondaryButton onClick={() => setContentPrompt(false)}>
                Cancel
              </SecondaryButton>
            </div>
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

      <section className="panel">
        <p className="eyebrow">This week</p>
        {dashboard.week.map((w) => (
          <div className="support-row" key={w.type}>
            <div className="row">
              <span>{w.label}</span>
              <span className="tiny">
                {w.done} / {w.target}
              </span>
            </div>
            <ProgressBar done={w.done} target={w.target} />
          </div>
        ))}
        {pendingBonus && (
          <p className="chip good" style={{ marginTop: 12 }}>
            Weekly gift ready · ${pendingBonus.amount} out-of-pocket treat
          </p>
        )}
      </section>

      <section className="panel">
        <div className="row">
          <div>
            <p className="eyebrow">Venmo-matching total</p>
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

      <div className="grid-2">
        <Link href="/craving">
          <SecondaryButton>I&apos;m having a craving</SecondaryButton>
        </Link>
        <Link href="/settings">
          <SecondaryButton>Settings</SecondaryButton>
        </Link>
      </div>
    </main>
  );
}
