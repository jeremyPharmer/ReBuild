"use client";

import { useState, type ReactNode } from "react";
import type {
  RhythmWeek,
  SupportRhythm,
} from "@/lib/trends";

/** Collapsed-by-default section for Journey pattern panels. */
export function PatternCollapse({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `pattern-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="pattern-collapse">
      <button
        type="button"
        className="pattern-collapse-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="pattern-collapse-title">{title}</h2>
        <span className={open ? "caret open" : "caret"} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div id={panelId} className="pattern-collapse-body fade-in">
          {children}
        </div>
      )}
    </div>
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
        </div>
      ))}
    </>
  );
}
