"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { Money, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/ui";
import {
  assignedRewardForMilestone,
  projectedReclaimAt,
  suggestedRewardPool,
  waitingReclaimDays,
} from "@/lib/journey";

export default function HomePage() {
  const { state, dashboard, today } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  if (!state.profile?.onboarded || !dashboard) {
    return null;
  }

  const next = dashboard.next[0];
  const then = dashboard.next[1];
  const horizon = dashboard.next[2];
  const assigned = next
    ? assignedRewardForMilestone(state, next.dayNumber)
    : undefined;
  const projected = next ? projectedReclaimAt(state, next.dayNumber) : 0;
  const pool = next
    ? suggestedRewardPool(
        next.dayNumber,
        state.profile.historicalDailySpend,
      )
    : 0;
  const waiting = waitingReclaimDays(state);
  const pendingBonus = state.weeklyBonuses.find((b) => !b.confirmed);
  const latestMilestone = [...state.milestones]
    .filter((m) => m.runId === state.profile!.currentRunId)
    .sort((a, b) => b.dayNumber - a.dayNumber)[0];

  return (
    <main className="fade-in stack">
      <header className="hero-day">
        <p className="eyebrow">REBUILD</p>
        <h1>{dashboard.label}</h1>
        <p className="muted">
          Cannabis + alcohol · abstinence · {today}
        </p>
      </header>

      <section className="panel">
        <div className="row">
          <div>
            <p className="eyebrow">Money</p>
            <p className="money money-xl">
              <Money value={dashboard.reclaimed} />
            </p>
            <p className="tiny">reclaimed · set aside</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="tiny">Waiting</p>
            <p className="money" style={{ fontSize: "1.4rem" }}>
              <Money value={dashboard.waiting} />
            </p>
            <p className="tiny">{dashboard.waitingDays} days</p>
          </div>
        </div>
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
            {next.dayNumber - dashboard.cleanDays === 1 ? "" : "s"} away
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <p className="tiny">Projected reward pool</p>
              <p className="money" style={{ fontSize: "1.35rem" }}>
                <Money value={projected || pool} />
              </p>
            </div>
            {assigned && (
              <div style={{ textAlign: "right" }}>
                <p className="tiny">My reward</p>
                <p style={{ fontWeight: 600 }}>{assigned.name}</p>
                <p className="tiny">
                  <Money value={dashboard.reclaimed} /> /{" "}
                  <Money value={assigned.estimatedCost} />
                </p>
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
          <div style={{ marginTop: 14 }}>
            <Link href="/money">
              <SecondaryButton>Explore rewards</SecondaryButton>
            </Link>
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
        <p className="eyebrow">Today</p>
        <div className="list-check">
          {!dashboard.todayMorning ? (
            <Link href="/morning" className="check-item">
              <span className="check-box" />
              <div>
                <strong>Start the day</strong>
                <p className="tiny">Morning check-in · 2–4 min</p>
              </div>
            </Link>
          ) : (
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

          {state.profile.supports
            .filter((s) => s.enabled)
            .map((s) => {
              const done = dashboard.todaySupports.some(
                (t) => t.supportType === s.type,
              );
              return (
                <Link
                  key={s.type}
                  href="/plan"
                  className={done ? "check-item done" : "check-item"}
                >
                  <span className="check-box">{done ? "✓" : ""}</span>
                  <div>
                    <strong>{s.label}</strong>
                    <p className="tiny">
                      {done ? "Done today" : "Tap to log on Plan"}
                    </p>
                  </div>
                </Link>
              );
            })}

          {!dashboard.todayEvening ? (
            <Link href="/evening" className="check-item">
              <span className="check-box" />
              <div>
                <strong>Close the day</strong>
                <p className="tiny">Evening · ~30–60 sec + one line</p>
              </div>
            </Link>
          ) : (
            <div className="check-item done">
              <span className="check-box">✓</span>
              <div>
                <strong>Evening complete</strong>
                <p className="tiny">{dashboard.todayEvening.oneLine}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {latestMilestone && (
        <section className="panel">
          <p className="eyebrow">Latest milestone this run</p>
          <h2>
            Day {latestMilestone.dayNumber} · {latestMilestone.title}
          </h2>
        </section>
      )}

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
