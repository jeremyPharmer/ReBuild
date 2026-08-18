"use client";

import type {
  HeadwindHours,
  PlaybookRow,
  RhythmWeek,
  SupportRhythm,
} from "@/lib/trends";
import { formatDrop } from "@/lib/trends";

export function PlaybookPanel({ rows }: { rows: PlaybookRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="muted" style={{ marginTop: 8 }}>
        Log a few cravings through to an outcome — this fills in after 3.
      </p>
    );
  }
  const maxDrop = Math.max(...rows.map((r) => r.avgDrop), 1);
  return (
    <>
      <p className="tiny" style={{ marginTop: 6, lineHeight: 1.45 }}>
        What brought intensity down, on average. Not a diagnosis.
      </p>
      <ul className="playbook">
        {rows.map((r) => (
          <li key={r.outcome} className="playbook-row">
            <div className="row">
              <span>{r.outcome}</span>
              <span className="playbook-meta">
                −{formatDrop(r.avgDrop)} · n={r.n}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(r.avgDrop / maxDrop) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function HeadwindPanel({ hours }: { hours: HeadwindHours }) {
  if (hours.total === 0) {
    return (
      <p className="muted" style={{ marginTop: 8 }}>
        Headwind hours appear when you log a craving.
      </p>
    );
  }
  const maxPart = Math.max(...hours.byDaypart.map((p) => p.count), 1);
  const maxDay = Math.max(...hours.byWeekday.map((d) => d.count), 1);
  return (
    <>
      {hours.peak ? (
        <p style={{ marginTop: 8, lineHeight: 1.45 }}>
          Most headwinds land in the {hours.peak.label} ({hours.peak.hoursLabel}
          ).
        </p>
      ) : (
        <p className="tiny" style={{ marginTop: 8, lineHeight: 1.45 }}>
          When cravings showed up. Not a diagnosis.
        </p>
      )}
      <div className="pattern-bars">
        {hours.byDaypart.map((p) => (
          <div
            key={p.key}
            className={
              hours.peak?.key === p.key ? "pattern-bar peak" : "pattern-bar"
            }
          >
            <span className="tiny">{p.count}</span>
            <div className="pattern-bar-track">
              <div
                className="pattern-bar-fill"
                style={{ height: `${(p.count / maxPart) * 100}%` }}
              />
            </div>
            <span className="pattern-bar-label">{p.label}</span>
            <span className="tiny">{p.hoursLabel}</span>
          </div>
        ))}
      </div>
      <div className="pattern-bars weekday">
        {hours.byWeekday.map((d) => (
          <div key={d.weekday} className="pattern-bar">
            <span className="tiny">{d.count}</span>
            <div className="pattern-bar-track">
              <div
                className="pattern-bar-fill"
                style={{ height: `${(d.count / maxDay) * 100}%` }}
              />
            </div>
            <span className="pattern-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function RhythmPanel({
  rows,
  weeks,
}: {
  rows: SupportRhythm[];
  weeks: RhythmWeek[];
}) {
  if (rows.length === 0) {
    return (
      <p className="muted" style={{ marginTop: 8 }}>
        Provision rhythm appears as you log supports.
      </p>
    );
  }
  return (
    <>
      <p className="tiny" style={{ marginTop: 6, lineHeight: 1.45 }}>
        Last four weeks vs the weekly target. Counts may go above the goal.
      </p>
      {rows.map((s) => (
        <div key={s.type} className="rhythm-row">
          <div className="row">
            <span>{s.label}</span>
            <span className="tiny">{s.target}/week</span>
          </div>
          <div className="rhythm-weeks">
            {s.weeks.map((w, i) => {
              const pct =
                w.target > 0 ? Math.min(100, (w.done / w.target) * 100) : 0;
              const met = w.target > 0 && w.done >= w.target;
              return (
                <div
                  key={w.start}
                  className={met ? "rhythm-week met" : "rhythm-week"}
                >
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="rhythm-week-count">
                    {w.done}/{w.target}
                  </span>
                  <span className="tiny">{weeks[i]?.label ?? ""}</span>
                </div>
              );
            })}
          </div>
          {s.contrast && (
            <p className="tiny rhythm-caveat">
              On {s.label.toLowerCase()} days, craving points averaged{" "}
              {formatDrop(s.contrast.withSupport.avgPoints)} vs{" "}
              {formatDrop(s.contrast.withoutSupport.avgPoints)} on other active
              days. Curiosity — not a diagnosis.
            </p>
          )}
        </div>
      ))}
    </>
  );
}
