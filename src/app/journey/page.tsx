"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  CONDITION_METRICS,
  filledTrendPointsInRange,
  formatTrendDate,
  resolveConditionRange,
  type ConditionMetric,
  type ConditionRangePreset,
} from "@/lib/trends";
import type { RebuildState } from "@/lib/types";

function LineChartFrame({
  width = 320,
  height = 180,
  points,
  series,
  rangeStart,
  rangeEnd,
  emptyMessage,
  footer,
}: {
  width?: number;
  height?: number;
  points: { date: string }[];
  series: {
    key: string;
    color: string;
    axis: "scale" | "hours";
    values: (number | undefined)[];
  }[];
  rangeStart: string;
  rangeEnd: string;
  emptyMessage: string;
  footer?: string;
}) {
  const scaleAxis = { min: 1, max: 10, ticks: [1, 4, 7, 10] };
  const hoursAxis = { min: 0, max: 14, ticks: [0, 7, 14] };
  const hasScale = series.some((s) => s.axis === "scale");
  const hasHours = series.some((s) => s.axis === "hours");
  const pad = {
    top: 16,
    right: hasScale && hasHours ? 28 : 12,
    bottom: 28,
    left: 28,
  };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const xSpan = Math.max(points.length - 1, 1);

  function yCoord(value: number, axis: "scale" | "hours"): number {
    const spec = axis === "hours" ? hoursAxis : scaleAxis;
    const span = Math.max(spec.max - spec.min, 1);
    return pad.top + innerH - ((value - spec.min) / span) * innerH;
  }

  const xs = points.map((_, i) =>
    points.length === 1
      ? pad.left + innerW / 2
      : pad.left + (i / xSpan) * innerW,
  );

  const paths = series
    .map((s) => {
      const segments: { x: number; y: number }[][] = [];
      let current: { x: number; y: number }[] = [];
      for (let i = 0; i < s.values.length; i++) {
        const v = s.values[i];
        if (v === undefined) {
          if (current.length > 0) {
            segments.push(current);
            current = [];
          }
          continue;
        }
        current.push({ x: xs[i], y: yCoord(v, s.axis) });
      }
      if (current.length > 0) segments.push(current);
      if (segments.length === 0) return null;
      const d = segments
        .map((coords) =>
          coords
            .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
            .join(" "),
        )
        .join(" ");
      const coords = segments.flat();
      return { ...s, d, coords };
    })
    .filter(Boolean) as {
    key: string;
    color: string;
    d: string;
    coords: { x: number; y: number }[];
  }[];

  const first = rangeStart;
  const last = rangeEnd;

  if (points.length === 0) {
    return (
      <p className="muted" style={{ marginTop: 12 }}>
        {emptyMessage}
      </p>
    );
  }

  const axisLeft = pad.left;
  const axisRight = width - pad.right;
  const axisY = height - 10;
  const leftTicks = hasScale ? scaleAxis.ticks : hoursAxis.ticks;
  const rightTicks = hasScale && hasHours ? hoursAxis.ticks : [];

  return (
    <>
      <svg
        key={`${rangeStart}-${rangeEnd}-${points.length}`}
        className="trend-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trend chart"
      >
        {leftTicks.map((v) => {
          const y = yCoord(v, hasScale ? "scale" : "hours");
          return (
            <g key={`left-${v}`}>
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
        {rightTicks.map((v) => {
          const y = yCoord(v, "hours");
          return (
            <text
              key={`right-${v}`}
              x={width - 4}
              y={y + 3}
              textAnchor="end"
              className="trend-axis"
            >
              {v}
            </text>
          );
        })}
        <line
          x1={axisLeft}
          x2={axisRight}
          y1={axisY}
          y2={axisY}
          className="trend-axis-line"
        />
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
          <text x={axisLeft} y={height - 8} className="trend-axis">
            {formatTrendDate(first)}
          </text>
        )}
        {last && last !== first && (
          <text
            x={axisRight}
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
  { key: "30", label: "30 days" },
  { key: "60", label: "60 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All" },
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
    sleepHours: true,
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
    () => filledTrendPointsInRange(state, range.start, range.end),
    [state, range.start, range.end],
  );

  const series = CONDITION_METRICS.filter((m) => active[m.key]).map((m) => ({
    key: m.key,
    color: m.color,
    axis: m.axis,
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
        points={points}
        series={series}
        rangeStart={range.start}
        rangeEnd={range.end}
        emptyMessage="Trends appear as you log mornings."
        footer="Sleep hours (0–14) · sleep quality, mood, energy, stress (1–10). Tap to show or hide."
      />
    </div>
  );
}

export default function JourneyPage() {
  const { state, dashboard, today } = useApp();
  const journeyStart =
    state.profile?.currentRunStartedOn ??
    state.profile?.startDate ??
    today ??
    "";

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
      </section>
    </main>
  );
}
