"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { cleanDaysThisRun } from "@/lib/journey";
import {
  alignmentTrailLabel,
  formatSleepHours,
  trailDayLabel,
  trailDaysThisRun,
  type TrailDay,
} from "@/lib/trail";
import {
  TREND_METRICS,
  formatTrendDate,
  trendPointsLastYear,
  type TrendMetric,
} from "@/lib/trends";
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
  defaultCollapsed,
}: {
  day: TrailDay;
  supportLabel: (type: string) => string;
  defaultCollapsed: boolean;
}) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const evening = day.evening;
  const morning = day.morning;
  const thesis =
    evening?.oneLine?.trim() ||
    morning?.intention?.trim() ||
    "Day marked on the trail";

  return (
    <article className={open ? "trail-day" : "trail-day collapsed"}>
      <button
        type="button"
        className="trail-day-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="trail-day-toggle-main">
          <span className="tiny trail-day-toggle-label">
            Day {day.dayNumber} · {day.date.slice(5).replace("-", "/")}
          </span>
          {!open && (
            <span className="trail-day-thesis">&ldquo;{thesis}&rdquo;</span>
          )}
          {open && <strong className="trail-day-toggle-title">{trailDayLabel(day)}</strong>}
        </div>
        <div className="trail-day-toggle-meta">
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
          <span className={open ? "caret open" : "caret"} aria-hidden>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="trail-day-body fade-in">
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
              {day.supports
                .filter(
                  (s) => s.supportType === "recovery_content" && s.actionNote,
                )
                .map((s) => (
                  <p
                    key={`${s.supportType}-note`}
                    className="tiny"
                    style={{ marginTop: 8 }}
                  >
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
        </div>
      )}
    </article>
  );
}

function TrendsChart({
  points,
}: {
  points: ReturnType<typeof trendPointsLastYear>;
}) {
  const [active, setActive] = useState<Record<TrendMetric, boolean>>({
    sleepQuality: true,
    mood: true,
    energy: true,
    stress: true,
    craving: true,
  });

  const width = 320;
  const height = 180;
  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const paths = useMemo(() => {
    if (points.length === 0) return [];
    const xs = points.map((_, i) =>
      points.length === 1
        ? pad.left + innerW / 2
        : pad.left + (i / (points.length - 1)) * innerW,
    );
    return TREND_METRICS.filter((m) => active[m.key]).map((metric) => {
      const coords = points
        .map((p, i) => {
          const v = p[metric.key];
          if (v === undefined) return null;
          const y = pad.top + innerH - ((v - 1) / 9) * innerH;
          return { x: xs[i], y };
        })
        .filter(Boolean) as { x: number; y: number }[];
      if (coords.length === 0) return null;
      const d = coords
        .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
        .join(" ");
      return { ...metric, d, coords };
    }).filter(Boolean) as {
      key: TrendMetric;
      label: string;
      color: string;
      d: string;
      coords: { x: number; y: number }[];
    }[];
  }, [points, active, innerW, innerH]);

  function toggle(key: TrendMetric) {
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const first = points[0]?.date;
  const last = points[points.length - 1]?.date;

  return (
    <div className="trends">
      <div className="trend-toggles">
        {TREND_METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            className={active[m.key] ? "trend-toggle on" : "trend-toggle"}
            style={{ ["--trend" as string]: m.color }}
            onClick={() => toggle(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {points.length === 0 ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Trends appear as you log mornings and evenings.
        </p>
      ) : (
        <>
          <svg
            className="trend-svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Condition trends over time"
          >
            {[1, 4, 7, 10].map((v) => {
              const y = pad.top + innerH - ((v - 1) / 9) * innerH;
              return (
                <g key={v}>
                  <line
                    x1={pad.left}
                    x2={width - pad.right}
                    y1={y}
                    y2={y}
                    className="trend-grid"
                  />
                  <text x={4} y={y + 3} className="trend-axis">
                    {v}
                  </text>
                </g>
              );
            })}
            {paths.map((p) => (
              <g key={p.key}>
                <path d={p.d} fill="none" stroke={p.color} strokeWidth="2.25" />
                {p.coords.map((c, i) => (
                  <circle
                    key={`${p.key}-${i}`}
                    cx={c.x}
                    cy={c.y}
                    r="3.2"
                    fill={p.color}
                  />
                ))}
              </g>
            ))}
            {first && (
              <text
                x={pad.left}
                y={height - 8}
                className="trend-axis"
              >
                {formatTrendDate(first)}
              </text>
            )}
            {last && last !== first && (
              <text
                x={width - pad.right}
                y={height - 8}
                textAnchor="end"
                className="trend-axis"
              >
                {formatTrendDate(last)}
              </text>
            )}
          </svg>
          <p className="tiny" style={{ marginTop: 8 }}>
            Last year of check-ins · tap a metric to show or hide
          </p>
        </>
      )}
    </div>
  );
}

export default function JourneyPage() {
  const { state, dashboard, today } = useApp();
  const clean = dashboard?.cleanDays ?? cleanDaysThisRun(state);
  const runId = state.profile?.currentRunId;
  const achievedThisRun = new Set(
    state.milestones.filter((m) => m.runId === runId).map((m) => m.dayNumber),
  );
  const trailDays = useMemo(() => {
    if (!today) return [];
    return trailDaysThisRun(state, today);
  }, [state, today]);
  const trendPoints = useMemo(() => {
    if (!today) return [];
    return trendPointsLastYear(state, today);
  }, [state, today]);

  function supportLabel(type: string) {
    return state.profile?.supports.find((s) => s.type === type)?.label ?? type;
  }

  return (
    <main className="stack fade-in">
      <header className="hero-day">
        <p className="eyebrow">Journey</p>
        <h1>{dashboard?.label ?? "Journey"}</h1>
      </header>

      <section className="panel">
        <p className="eyebrow">Trail log</p>
        <h2 style={{ marginBottom: 12 }}>This climb</h2>
        {trailDays.length === 0 && (
          <p className="muted">
            No trail days yet — start or close a day to leave a mark.
          </p>
        )}
        <div className="trail-log">
          {trailDays.map((day, index) => (
            <TrailDayCard
              key={day.date}
              day={day}
              supportLabel={supportLabel}
              defaultCollapsed={index > 0 || Boolean(day.evening && day.date < today)}
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
        <p className="eyebrow">Conditions over time</p>
        <h2 style={{ marginBottom: 10 }}>Trail weather</h2>
        <TrendsChart points={trendPoints} />
      </section>

      {state.returns.length > 0 && (
        <section className="panel">
          <p className="eyebrow">Storm breaks</p>
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
