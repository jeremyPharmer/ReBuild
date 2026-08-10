"use client";

import { useApp } from "@/components/AppProvider";
import { Money } from "@/components/ui";
import {
  cleanDaysThisRun,
  nextMilestones,
  suggestedRewardPool,
} from "@/lib/journey";
import { MILESTONE_DEFS } from "@/lib/types";

export default function JourneyPage() {
  const { state, dashboard } = useApp();
  const clean = dashboard?.cleanDays ?? cleanDaysThisRun(state);
  const next = nextMilestones(clean, 3);
  const runId = state.profile?.currentRunId;
  const achievedThisRun = new Set(
    state.milestones.filter((m) => m.runId === runId).map((m) => m.dayNumber),
  );
  const history = [...state.milestones].sort(
    (a, b) => b.achievedAt.localeCompare(a.achievedAt),
  );

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Adventure map</p>
        <h1>{dashboard?.label ?? "Journey"}</h1>
        <p className="muted">
          Where you are · next destination · then · on the horizon
        </p>
      </header>

      <section className="map">
        <div className="map-path" />
        <div className="map-node current">
          <p className="tiny">You are here</p>
          <h3>Day {clean}</h3>
          <p className="tiny">This run</p>
        </div>
        {next.map((m, i) => (
          <div key={m.dayNumber} className="map-node">
            <p className="tiny">
              {i === 0 ? "Next" : i === 1 ? "Then" : "On the horizon"}
            </p>
            <h3>
              Day {m.dayNumber} · {m.title}
            </h3>
            <p className="tiny">
              {m.type} · pool ~{" "}
              <Money
                value={suggestedRewardPool(
                  m.dayNumber,
                  state.profile?.historicalDailySpend ?? 0,
                )}
              />
            </p>
          </div>
        ))}
      </section>

      <section className="panel">
        <p className="eyebrow">Trail markers</p>
        <div className="trail-list">
          {MILESTONE_DEFS.filter((m) => m.dayNumber <= 180).map((m) => {
            const done = achievedThisRun.has(m.dayNumber);
            const isNext = next[0]?.dayNumber === m.dayNumber;
            return (
              <div
                key={m.dayNumber}
                className={
                  done
                    ? "trail-marker done"
                    : isNext
                      ? "trail-marker current"
                      : "trail-marker"
                }
              >
                <span className="trail-dot" aria-hidden />
                <div className="trail-marker-body">
                  <div className="row">
                    <span>
                      Day {m.dayNumber} · {m.title}
                    </span>
                    <span className="tiny">{m.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="tiny" style={{ marginTop: 8 }}>
          Full year trail continues through Day 365.
        </p>
      </section>

      <section className="panel">
        <p className="eyebrow">Milestone history</p>
        <p className="tiny" style={{ marginBottom: 10 }}>
          Past unlocks stay forever. After a return you re-climb; you can
          re-achieve milestones. Rewards grow larger as milestones get further.
        </p>
        {history.length === 0 && (
          <p className="muted">No milestones yet — Day 1 is waiting.</p>
        )}
        {history.map((m) => (
          <div key={m.id} className="support-row">
            <div className="row">
              <strong>
                Day {m.dayNumber} · {m.title}
              </strong>
              <span className="tiny">{m.type}</span>
            </div>
            <p className="tiny">
              Run {m.runId.slice(-6)} ·{" "}
              {new Date(m.achievedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </section>

      {state.returns.length > 0 && (
        <section className="panel">
          <p className="eyebrow">Storms weathered</p>
          {state.returns.map((r) => (
            <div key={r.id} className="support-row">
              <strong>{r.date}</strong>
              <p className="tiny">
                After {r.previousCleanDays} clean days
                {r.notes ? ` · ${r.notes}` : ""}
              </p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
