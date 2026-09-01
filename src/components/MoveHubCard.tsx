"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { WorkoutLogForm } from "@/components/workouts/WorkoutLogForm";
import {
  formatMiles,
  monthKey,
  weekWorkoutSummary,
} from "@/lib/workouts";
import { parseDate } from "@/lib/journey";

export function MoveHubCard() {
  const { state, today } = useApp();
  const initialMonth = useMemo(() => {
    const d = parseDate(today);
    return monthKey(d.getFullYear(), d.getMonth() + 1);
  }, [today]);
  const [month, setMonth] = useState(initialMonth);
  const week = weekWorkoutSummary(state.workouts, today);

  return (
    <section className="home-card home-card-move">
      <div className="home-card-head">
        <p className="home-card-kicker">Move</p>
        <h2>Workouts</h2>
        <p className="tiny home-card-sub">
          {week.qualityPoints} pt this week
          {week.runMiles > 0 ? ` · ${formatMiles(week.runMiles)} mi` : ""}
        </p>
      </div>

      <WorkoutLogForm date={today} variant="quick" />

      <WorkoutCalendar
        monthKey={month}
        today={today}
        workouts={state.workouts}
        compact
        onMonthChange={setMonth}
      />

      <Link href="/workouts" className="btn ghost workout-open-link">
        Open workouts →
      </Link>
    </section>
  );
}
