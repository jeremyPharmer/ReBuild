"use client";

import { useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import {
  formatMiles,
  monthWorkoutSummary,
  parseMonthKey,
  weekWorkoutSummary,
  WORKOUT_TYPES,
} from "@/lib/workouts";

function SummaryBlock({
  title,
  counts,
  runMiles,
  totalMinutes,
  qualityPoints,
  emphasizePoints,
}: {
  title: string;
  counts: Record<string, number>;
  runMiles: number;
  totalMinutes: number;
  qualityPoints: number;
  emphasizePoints?: boolean;
}) {
  const totalSessions = WORKOUT_TYPES.reduce(
    (sum, t) => sum + (counts[t.id] ?? 0),
    0,
  );

  return (
    <div className="workout-summary-block">
      <p className="eyebrow">{title}</p>
      {emphasizePoints && (
        <div className="workout-week-points">
          <span className="workout-week-points-value">{qualityPoints}</span>
          <span className="workout-week-points-label">
            quality point{qualityPoints === 1 ? "" : "s"}
          </span>
        </div>
      )}
      <div className="workout-summary-grid">
        {WORKOUT_TYPES.map((t) => (
          <div key={t.id} className={`workout-summary-stat ${t.id}`}>
            <span className="workout-summary-count">{counts[t.id] ?? 0}</span>
            <span className="workout-summary-label">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="workout-summary-meta">
        {!emphasizePoints && (
          <span>
            {qualityPoints} pt{qualityPoints === 1 ? "" : "s"}
          </span>
        )}
        <span>{formatMiles(runMiles)} mi run</span>
        {totalMinutes > 0 && <span>{totalMinutes} min total</span>}
        {totalSessions > 0 && (
          <span>
            {totalSessions} session{totalSessions === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}

export function WorkoutSummaryPanel({
  monthKey,
  today,
}: {
  monthKey: string;
  today: string;
}) {
  const { state } = useApp();
  const { year, month } = useMemo(
    () => parseMonthKey(monthKey),
    [monthKey],
  );

  const week = weekWorkoutSummary(state.workouts, today);
  const monthSummary = monthWorkoutSummary(state.workouts, year, month);

  return (
    <section className="panel workout-summary-panel">
      <p className="eyebrow">Summary</p>
      <div className="workout-summary-stack">
        <SummaryBlock
          title="This week"
          counts={week.counts}
          runMiles={week.runMiles}
          totalMinutes={week.totalMinutes}
          qualityPoints={week.qualityPoints}
          emphasizePoints
        />
        <SummaryBlock
          title="This month"
          counts={monthSummary.counts}
          runMiles={monthSummary.runMiles}
          totalMinutes={monthSummary.totalMinutes}
          qualityPoints={monthSummary.qualityPoints}
        />
      </div>
    </section>
  );
}
