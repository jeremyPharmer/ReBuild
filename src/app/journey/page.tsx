"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  cleanDaysThisRun,
  isCashableMilestoneDay,
  rewardOutcomeForTrailDay,
} from "@/lib/journey";
import { Money } from "@/components/ui";
import {
  formatSleepHours,
  trailDayLabel,
  trailDaysThisRun,
  type TrailDay,
} from "@/lib/trail";
import {
  HeadwindPanel,
  PatternCollapse,
  PlaybookPanel,
  RhythmPanel,
} from "@/components/JourneyPatterns";
import {
  CONDITION_METRICS,
  cravingHeadwindHours,
  cravingPlaybook,
  formatTrendDate,
  lastFourWeeks,
  resolveConditionRange,
  supportRhythmLastFourWeeks,
  trendPointsInRange,
  type ConditionMetric,
  type ConditionRangePreset,
  type TrendPoint,
} from "@/lib/trends";
import type { RebuildState } from "@/lib/types";
import { formatCravingOutcomes } from "@/lib/craving-interventions";
import { MILESTONE_DEFS } from "@/lib/types";

function WeatherDots({
  mood,
  energy,
  stress,
}: {
  mood?: number;
  energy?: number;
  stress?: number;
}) {
  const bits = [
    mood !== undefined ? `Mood ${mood}` : null,
    energy !== undefined ? `Energy ${energy}` : null,
    stress !== undefined ? `Stress ${stress}` : null,
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
  const { post, state } = useApp();
  const [open, setOpen] = useState(!defaultCollapsed);
  const [editingIntention, setEditingIntention] = useState(false);
  const [intentionDraft, setIntentionDraft] = useState("");
  const [intentionBusy, setIntentionBusy] = useState(false);
  const [intentionError, setIntentionError] = useState("");
  const evening = day.evening;
  const morning = day.morning;
  const rewardDay = isCashableMilestoneDay(day.dayNumber);
  const rewardOutcome = rewardOutcomeForTrailDay(state, day.dayNumber);
  /** Collapsed row shows morning Set out intention (not evening one-line). */
  const thesis =
    morning?.intention?.trim() ||
    evening?.oneLine?.trim() ||
    "Day marked on the trail";

  function startEditIntention() {
    if (!morning) return;
    setIntentionDraft(morning.intention);
    setIntentionError("");
    setEditingIntention(true);
    setOpen(true);
  }

  async function saveIntention() {
    const next = intentionDraft.trim();
    if (!next || !morning) return;
    setIntentionBusy(true);
    setIntentionError("");
    try {
      await post("/api/morning", {
        action: "updateIntention",
        date: day.date,
        intention: next,
      });
      setEditingIntention(false);
    } catch (err) {
      setIntentionError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setIntentionBusy(false);
    }
  }

  return (
    <article className={open ? "trail-day" : "trail-day collapsed"}>
      <div className="trail-day-header">
        <button
          type="button"
          className="trail-day-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="trail-day-toggle-main">
            <span className="tiny trail-day-toggle-label">
              Day {day.dayNumber}
              {rewardDay && (
                <span className="trail-reward-star" title="Reward day">
                  *
                </span>
              )}
            </span>
            {!open && (
              <span className="trail-day-thesis">&ldquo;{thesis}&rdquo;</span>
            )}
            {open && (
              <strong className="trail-day-toggle-title">
                {trailDayLabel(day)}
                {rewardDay ? " *" : ""}
              </strong>
            )}
          </div>
          <div className="trail-day-toggle-meta">
            <span className={open ? "caret open" : "caret"} aria-hidden>
              ▾
            </span>
          </div>
        </button>
      </div>

      {open && (
        <div className="trail-day-body fade-in">
          {morning && (
            <div className="trail-block">
              <div className="trail-block-head">
                <p className="tiny trail-block-label">Set out</p>
                <button
                  type="button"
                  className="trail-day-menu"
                  aria-label="Edit morning intention"
                  onClick={startEditIntention}
                >
                  ⋯
                </button>
              </div>
              {editingIntention ? (
                <div className="trail-intention-edit">
                  <label className="field">
                    <span className="field-label">
                      One thing you want to do well today
                    </span>
                    <input
                      type="text"
                      value={intentionDraft}
                      onChange={(e) => setIntentionDraft(e.target.value)}
                      autoFocus
                    />
                  </label>
                  {intentionError && (
                    <p className="tiny" style={{ color: "var(--danger)" }}>
                      {intentionError}
                    </p>
                  )}
                  <div className="trail-intention-actions">
                    <button
                      type="button"
                      className="btn primary"
                      disabled={intentionBusy || !intentionDraft.trim()}
                      onClick={saveIntention}
                    >
                      {intentionBusy ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={intentionBusy}
                      onClick={() => setEditingIntention(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                morning.intention && (
                  <p className="trail-quote">&ldquo;{morning.intention}&rdquo;</p>
                )
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
              />
              {morning.trigger && (
                <p className="tiny" style={{ marginTop: 6 }}>
                  Trigger or concern: {morning.trigger}
                </p>
              )}
            </div>
          )}

          {!morning && (
            <div className="trail-block">
              <p className="tiny trail-block-label">Set out</p>
            </div>
          )}

          <div className="trail-block">
            <p className="tiny trail-block-label">Provisions</p>
            {(day.supports.length > 0 || day.provisions.length > 0) && (
              <div className="trail-provisions">
                {day.supports.map((s) => (
                  <span key={s.supportType} className="provision-chip">
                    {supportLabel(s.supportType)}
                  </span>
                ))}
                {day.provisions.map((p) => (
                  <span
                    key={p.id}
                    className={
                      p.completed
                        ? "provision-chip"
                        : "provision-chip provision-chip-open"
                    }
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            )}
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

          <div className="trail-block">
            <p className="tiny trail-block-label">Headwind</p>
            {day.cravings.map((c) => {
              const outcomes = formatCravingOutcomes(c);
              return (
              <div key={c.id} className="trail-craving">
                <p className="tiny">
                  Intensity {c.intensityBefore}
                  {c.intensityAfter !== undefined
                    ? ` → ${c.intensityAfter}`
                    : ""}
                  {outcomes
                    ? ` · ${outcomes}`
                    : c.intervention === "delay"
                      ? " · waited"
                      : ""}
                </p>
                {c.situation && (
                  <PrivateReveal label="Reveal situation">
                    <p className="trail-private-text">{c.situation}</p>
                  </PrivateReveal>
                )}
              </div>
              );
            })}
          </div>

          {rewardDay && (
            <div className="trail-block">
              <p className="tiny trail-block-label">Reward</p>
              {rewardOutcome && (
                <>
                  <p className="tiny" style={{ marginTop: 2 }}>
                    {rewardOutcome.moment.title}
                  </p>
                  {rewardOutcome.kind === "pending" && (
                    <p className="muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                      Waiting on Home — Claim reward or Save for future.
                    </p>
                  )}
                  {rewardOutcome.kind === "save" && (
                    <>
                      <p style={{ marginTop: 6, lineHeight: 1.45 }}>
                        Saved $ for the Future — short-term treat stayed parked.
                      </p>
                      {rewardOutcome.decision.note && (
                        <p
                          className="tiny"
                          style={{ marginTop: 6, lineHeight: 1.45 }}
                        >
                          {rewardOutcome.decision.note}
                        </p>
                      )}
                      {rewardOutcome.decision.photoId && (
                        <div className="trail-reward-photo">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/photos/${encodeURIComponent(rewardOutcome.decision.photoId)}`}
                            alt={rewardOutcome.decision.note || "Celebration"}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {rewardOutcome.kind === "treat" && (
                    <>
                      <p style={{ marginTop: 6, lineHeight: 1.45 }}>
                        Claimed
                        {rewardOutcome.reward?.name
                          ? `: ${rewardOutcome.reward.name}`
                          : ""}
                        {rewardOutcome.decision.amount > 0 && (
                          <>
                            {" "}
                            · <Money value={rewardOutcome.decision.amount} />
                          </>
                        )}
                      </p>
                      {(rewardOutcome.reward?.notes ||
                        rewardOutcome.decision.note) && (
                        <p
                          className="tiny"
                          style={{ marginTop: 6, lineHeight: 1.45 }}
                        >
                          {rewardOutcome.reward?.notes ||
                            rewardOutcome.decision.note}
                        </p>
                      )}
                      {rewardOutcome.reward?.photoId && (
                        <div className="trail-reward-photo">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/photos/${encodeURIComponent(rewardOutcome.reward.photoId)}`}
                            alt={rewardOutcome.reward.name}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <div className="trail-block">
            <p className="tiny trail-block-label">Make camp</p>
            {evening && (
              <>
                <WeatherDots mood={evening.mood} stress={evening.stress} />
                {evening.oneLine && (
                  <p className="trail-quote" style={{ marginTop: 8 }}>
                    &ldquo;{evening.oneLine}&rdquo;
                  </p>
                )}
                {evening.expandedJournal && (
                  <p className="tiny" style={{ marginTop: 8, lineHeight: 1.45 }}>
                    {evening.expandedJournal}
                  </p>
                )}
                {evening.returnNotes && (
                  <PrivateReveal label="Reveal storm notes">
                    <p className="trail-private-text">{evening.returnNotes}</p>
                  </PrivateReveal>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function LineChartFrame({
  width = 320,
  height = 180,
  yMin,
  yMax,
  yTicks,
  points,
  series,
  emptyMessage,
  footer,
}: {
  width?: number;
  height?: number;
  yMin: number;
  yMax: number;
  yTicks: number[];
  points: { date: string }[];
  series: {
    key: string;
    color: string;
    values: (number | undefined)[];
  }[];
  emptyMessage: string;
  footer?: string;
}) {
  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const range = Math.max(yMax - yMin, 1);

  const xs = points.map((_, i) =>
    points.length === 1
      ? pad.left + innerW / 2
      : pad.left + (i / (points.length - 1)) * innerW,
  );

  const paths = series
    .map((s) => {
      const coords = s.values
        .map((v, i) => {
          if (v === undefined) return null;
          const y = pad.top + innerH - ((v - yMin) / range) * innerH;
          return { x: xs[i], y };
        })
        .filter(Boolean) as { x: number; y: number }[];
      if (coords.length === 0) return null;
      const d = coords
        .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
        .join(" ");
      return { ...s, d, coords };
    })
    .filter(Boolean) as {
    key: string;
    color: string;
    d: string;
    coords: { x: number; y: number }[];
  }[];

  const first = points[0]?.date;
  const last = points[points.length - 1]?.date;

  if (points.length === 0) {
    return (
      <p className="muted" style={{ marginTop: 12 }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <svg
        className="trend-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trend chart"
      >
        {yTicks.map((v) => {
          const y = pad.top + innerH - ((v - yMin) / range) * innerH;
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
          <text x={pad.left} y={height - 8} className="trend-axis">
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
      {footer && (
        <p className="tiny" style={{ marginTop: 8 }}>
          {footer}
        </p>
      )}
    </>
  );
}

const CONDITION_RANGE_OPTIONS: { key: ConditionRangePreset; label: string }[] = [
  { key: "14", label: "14 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

function ConditionsChart({
  state,
  today,
  journeyStart,
}: {
  state: RebuildState;
  today: string;
  journeyStart: string;
}) {
  const [preset, setPreset] = useState<ConditionRangePreset>("all");
  const [customStart, setCustomStart] = useState(journeyStart);
  const [customEnd, setCustomEnd] = useState(today);
  const [active, setActive] = useState<Record<ConditionMetric, boolean>>({
    sleepQuality: true,
    mood: true,
    energy: true,
    stress: true,
  });

  function toggle(key: ConditionMetric) {
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectPreset(next: ConditionRangePreset) {
    setPreset(next);
    if (next === "custom") {
      const bounds = resolveConditionRange(preset, journeyStart, today, {
        start: customStart,
        end: customEnd,
      });
      setCustomStart(bounds.start);
      setCustomEnd(bounds.end);
    }
  }

  const range = useMemo(
    () =>
      resolveConditionRange(
        preset,
        journeyStart,
        today,
        preset === "custom" ? { start: customStart, end: customEnd } : undefined,
      ),
    [preset, journeyStart, today, customStart, customEnd],
  );

  const points = useMemo(
    () => trendPointsInRange(state, range.start, range.end),
    [state, range.start, range.end],
  );

  const series = CONDITION_METRICS.filter((m) => active[m.key]).map((m) => ({
    key: m.key,
    color: m.color,
    values: points.map((p) => p[m.key]),
  }));

  return (
    <div className="trends">
      <div className="trend-range-toggles" role="group" aria-label="Date range">
        {CONDITION_RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={
              preset === option.key ? "trend-range-toggle on" : "trend-range-toggle"
            }
            onClick={() => selectPreset(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="trend-custom-range">
          <label className="trend-custom-field">
            <span className="field-label">From</span>
            <input
              type="date"
              value={customStart}
              min={journeyStart}
              max={customEnd}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </label>
          <label className="trend-custom-field">
            <span className="field-label">To</span>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={today}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </label>
        </div>
      )}
      <div className="trend-toggles">
        {CONDITION_METRICS.map((m) => (
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
      <LineChartFrame
        yMin={1}
        yMax={10}
        yTicks={[1, 4, 7, 10]}
        points={points}
        series={series}
        emptyMessage="Trends appear as you log mornings."
        footer="Sleep quality · mood · energy · stress (1–10). Tap to show or hide."
      />
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
  const journeyStart =
    state.profile?.currentRunStartedOn ??
    state.profile?.startDate ??
    today ??
    "";
  const playbook = useMemo(() => {
    if (!today) return [];
    return cravingPlaybook(state, today);
  }, [state, today]);
  const headwind = useMemo(() => {
    if (!today) {
      return {
        total: 0,
        byDaypart: [],
        byWeekday: [],
      };
    }
    return cravingHeadwindHours(state, today);
  }, [state, today]);
  const rhythmWeeks = useMemo(
    () => (today ? lastFourWeeks(today) : []),
    [today],
  );
  const rhythm = useMemo(() => {
    if (!today) return [];
    return supportRhythmLastFourWeeks(state, today);
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
        <p className="eyebrow">Over time</p>
        <h2 style={{ marginBottom: 10 }}>Conditions</h2>
        {today && journeyStart && (
          <ConditionsChart
            state={state}
            today={today}
            journeyStart={journeyStart}
          />
        )}
        <PatternCollapse title="What worked">
          <PlaybookPanel rows={playbook} />
        </PatternCollapse>
        <PatternCollapse title="Headwind hours">
          <HeadwindPanel hours={headwind} />
        </PatternCollapse>
        <PatternCollapse title="Provision rhythm">
          <RhythmPanel rows={rhythm} weeks={rhythmWeeks} />
        </PatternCollapse>
      </section>

      <section className="panel">
        <p className="eyebrow">Trail log</p>
        <h2 style={{ marginBottom: 12 }}>This climb</h2>
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
              defaultCollapsed={day.date < today}
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
