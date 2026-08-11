"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Money } from "@/components/ui";
import {
  cleanDaysThisRun,
  nextIncentive,
  projectedReclaimAt,
} from "@/lib/journey";
import {
  alignmentTrailLabel,
  formatSleepHours,
  trailDayLabel,
  trailDaysThisRun,
  type TrailDay,
} from "@/lib/trail";
import { MILESTONE_DEFS } from "@/lib/types";

function WeatherDots({
  mood,
  energy,
  stress,
  craving,
}: {
  mood?: number;
  energy?: number;
  stress?: number;
  craving?: number;
}) {
  const bits = [
    mood !== undefined ? `Mood ${mood}` : null,
    energy !== undefined ? `Energy ${energy}` : null,
    stress !== undefined ? `Stress ${stress}` : null,
    craving !== undefined ? `Craving ${craving}` : null,
  ].filter(Boolean);
  if (bits.length === 0) return null;
  return <p className="tiny trail-conditions">{bits.join(" · ")}</p>;
}

function PrivateReveal({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="private-reveal">
      {!open ? (
        <button
          type="button"
          className="private-reveal-btn"
          onClick={() => setOpen(true)}
        >
          {label}
        </button>
      ) : (
        <div className="private-reveal-body fade-in">
          {children}
          <button
            type="button"
            className="private-reveal-hide"
            onClick={() => setOpen(false)}
          >
            Hide
          </button>
        </div>
      )}
    </div>
  );
}

function TrailDayCard({
  day,
  supportLabel,
}: {
  day: TrailDay;
  supportLabel: (type: string) => string;
}) {
  const evening = day.evening;
  const morning = day.morning;

  return (
    <article className="trail-day">
      <header className="trail-day-head">
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>
            Trail day
          </p>
          <h3>{trailDayLabel(day)}</h3>
        </div>
        {evening && (
          <span
            className={
              evening.alignment === "aligned"
                ? "chip good"
                : evening.alignment === "return_to_use"
                  ? "chip warn"
                  : "chip"
            }
          >
            {evening.alignment === "aligned"
              ? "Aligned"
              : evening.alignment === "return_to_use"
                ? "Storm"
                : "Other"}
          </span>
        )}
      </header>

      {morning && (
        <div className="trail-block">
          <p className="tiny trail-block-label">Set out</p>
          {morning.intention && (
            <p className="trail-quote">&ldquo;{morning.intention}&rdquo;</p>
          )}
          <p className="tiny">
            Sleep {formatSleepHours(morning.sleepHours)} hrs
            {morning.sleepQuality
              ? ` · quality ${morning.sleepQuality}/10`
              : ""}
          </p>
          <WeatherDots
            mood={morning.mood}
            energy={morning.energy}
            stress={morning.stress}
            craving={morning.craving}
          />
          {morning.trigger && (
            <p className="tiny" style={{ marginTop: 6 }}>
              Trigger on the mind: {morning.trigger}
            </p>
          )}
        </div>
      )}

      {day.supports.length > 0 && (
        <div className="trail-block">
          <p className="tiny trail-block-label">Provisions</p>
          <div className="trail-provisions">
            {day.supports.map((s) => (
              <span key={s.supportType} className="provision-chip">
                {supportLabel(s.supportType)}
              </span>
            ))}
          </div>
          {/* Titles for recovery content arrive with RB-005; note is a soft stand-in */}
          {day.supports
            .filter((s) => s.supportType === "recovery_content" && s.actionNote)
            .map((s) => (
              <p key={`${s.supportType}-note`} className="tiny" style={{ marginTop: 8 }}>
                Content note: {s.actionNote}
              </p>
            ))}
        </div>
      )}

      {day.cravings.length > 0 && (
        <div className="trail-block">
          <p className="tiny trail-block-label">Headwind</p>
          {day.cravings.map((c) => (
            <div key={c.id} className="trail-craving">
              <p className="tiny">
                Intensity {c.intensityBefore}
                {c.intensityAfter !== undefined
                  ? ` → ${c.intensityAfter}`
                  : ""}
                {c.outcome || c.intervention
                  ? ` · ${c.outcome || c.intervention}`
                  : ""}
              </p>
              {c.situation && (
                <PrivateReveal label="Reveal situation">
                  <p className="trail-private-text">{c.situation}</p>
                </PrivateReveal>
              )}
            </div>
          ))}
        </div>
      )}

      {evening && (
        <div className="trail-block">
          <p className="tiny trail-block-label">Make camp</p>
          <p className="tiny">{alignmentTrailLabel(evening.alignment)}</p>
          <WeatherDots mood={evening.mood} craving={evening.craving} />
          {evening.oneLine && (
            <p className="trail-quote" style={{ marginTop: 8 }}>
              &ldquo;{evening.oneLine}&rdquo;
            </p>
          )}
          {evening.returnNotes && (
            <PrivateReveal label="Reveal storm notes">
              <p className="trail-private-text">{evening.returnNotes}</p>
            </PrivateReveal>
          )}
        </div>
      )}
    </article>
  );
}

export default function JourneyPage() {
  const { state, dashboard, today } = useApp();
  const clean = dashboard?.cleanDays ?? cleanDaysThisRun(state);
  const incentive = nextIncentive(clean);
  const runId = state.profile?.currentRunId;
  const achievedThisRun = new Set(
    state.milestones.filter((m) => m.runId === runId).map((m) => m.dayNumber),
  );
  const history = [...state.milestones].sort(
    (a, b) => b.achievedAt.localeCompare(a.achievedAt),
  );
  const trailDays = useMemo(() => {
    if (!today) return [];
    return trailDaysThisRun(state, today);
  }, [state, today]);

  function supportLabel(type: string) {
    return state.profile?.supports.find((s) => s.type === type)?.label ?? type;
  }

  const projected = incentive
    ? projectedReclaimAt(state, incentive.dayNumber, today)
    : 0;

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Adventure map</p>
        <h1>{dashboard?.label ?? "Journey"}</h1>
        <p className="muted">
          This climb · trail days · landmarks · storms as chapters
        </p>
      </header>

      <section className="map">
        <div className="map-path" />
        <div className="map-node current">
          <p className="tiny">You are here</p>
          <h3>Day {clean}</h3>
          <p className="tiny">This run</p>
        </div>
        {incentive && (
          <div className="map-node">
            <p className="tiny">Next incentive</p>
            <h3>
              Day {incentive.dayNumber} · {incentive.title}
            </h3>
            <p className="tiny">
              {incentive.dayNumber - clean} day
              {incentive.dayNumber - clean === 1 ? "" : "s"} away
              {projected > 0 ? (
                <>
                  {" "}
                  · toward ~<Money value={projected} />
                </>
              ) : null}
            </p>
          </div>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Trail log</p>
        <h2 style={{ marginBottom: 6 }}>This climb</h2>
        <p className="tiny" style={{ marginBottom: 12 }}>
          Days with activity on the current run. Private details stay tucked
          away until you ask.
        </p>
        {trailDays.length === 0 && (
          <p className="muted">
            No trail days yet — start or close a day to leave a mark.
          </p>
        )}
        <div className="trail-log">
          {trailDays.map((day) => (
            <TrailDayCard
              key={day.date}
              day={day}
              supportLabel={supportLabel}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Trail markers</p>
        <div className="trail-list">
          {MILESTONE_DEFS.filter((m) => m.dayNumber <= 180).map((m) => {
            const done = achievedThisRun.has(m.dayNumber);
            const isHere = clean > 0 && m.dayNumber === clean;
            return (
              <div
                key={m.dayNumber}
                className={
                  done
                    ? "trail-marker done"
                    : isHere
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
          Past unlocks stay forever. After a storm you re-climb; you can
          re-achieve. Prior climbs remain as chapters behind the break.
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
          <p className="eyebrow">Storm breaks</p>
          <p className="tiny" style={{ marginBottom: 10 }}>
            Each storm ends a climb and starts the next chapter. Details stay
            private until you open them.
          </p>
          {state.returns.map((r) => (
            <div key={r.id} className="support-row storm-break">
              <strong>{r.date}</strong>
              <p className="tiny">After {r.previousCleanDays} clean days</p>
              {r.notes && (
                <PrivateReveal label="Reveal storm notes">
                  <p className="trail-private-text">{r.notes}</p>
                </PrivateReveal>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
