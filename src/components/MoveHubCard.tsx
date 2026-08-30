"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import {
  formatMiles,
  monthKey,
  parseMonthKey,
  weekRunMiles,
} from "@/lib/workouts";
import { parseDate } from "@/lib/journey";

export function MoveHubCard() {
  const { state, today } = useApp();
  const initialMonth = useMemo(() => {
    const d = parseDate(today);
    return monthKey(d.getFullYear(), d.getMonth() + 1);
  }, [today]);
  const [month, setMonth] = useState(initialMonth);
  const weekMiles = weekRunMiles(state.workouts, today);

  return (
    <section className="home-card home-card-move">
      <div className="home-card-head">
        <p className="home-card-kicker">Move</p>
        <h2>Workouts</h2>
        <p className="tiny home-card-sub">
          {formatMiles(weekMiles)} mi running this week
        </p>
      </div>

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
