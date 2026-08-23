"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { ProgressBar } from "@/components/ui";
import { formatDisplayDate, weekBounds } from "@/lib/journey";
import type { RebuildState } from "@/lib/types";

type WeekRow = {
  type: string;
  label: string;
  done: number;
  target: number;
};

export function WeekPlanPanel({
  state,
  today,
  week,
}: {
  state: RebuildState;
  today: string;
  week: WeekRow[];
}) {
  const { post } = useApp();
  const [busyType, setBusyType] = useState<string | null>(null);
  const { start, end } = weekBounds(today);

  async function toggleToday(type: string, currentlyDone: boolean) {
    setBusyType(type);
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: !currentlyDone,
      });
    } finally {
      setBusyType(null);
    }
  }

  if (week.length === 0) return null;

  return (
    <section className="panel">
      <p className="eyebrow">This week&apos;s plan</p>
      <p className="tiny" style={{ marginBottom: 10 }}>
        {formatDisplayDate(start)} – {formatDisplayDate(end)} · targets, not
        judgments
      </p>
      {week.map((w) => {
        const doneToday = state.supports.some(
          (s) => s.date === today && s.supportType === w.type && s.completed,
        );
        return (
          <div key={w.type} className="support-row">
            <div className="row">
              <div>
                <strong>{w.label}</strong>
                <p className="tiny">
                  {w.done} / {w.target} this week
                </p>
              </div>
              <button
                type="button"
                className="btn ghost"
                disabled={busyType === w.type}
                onClick={() => toggleToday(w.type, doneToday)}
              >
                {doneToday ? "Undo today" : "Done today"}
              </button>
            </div>
            <ProgressBar done={w.done} target={w.target} />
          </div>
        );
      })}
      {week.every((w) => w.done >= w.target) && (
        <p className="chip good" style={{ marginTop: 12 }}>
          Strong week — all supports hit. $20 treat gift unlocks.
        </p>
      )}
    </section>
  );
}
