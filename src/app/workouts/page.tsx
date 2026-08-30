"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { WorkoutLogForm } from "@/components/workouts/WorkoutLogForm";
import { WorkoutPrPanels } from "@/components/workouts/WorkoutPrPanels";
import {
  formatMiles,
  liftTypeLabel,
  monthRunMiles,
  monthKey,
  weekRunMiles,
  workoutsForDate,
} from "@/lib/workouts";
import { parseDate } from "@/lib/journey";

export default function WorkoutsPage() {
  const { state, today, post } = useApp();
  const initialMonth = useMemo(() => {
    const d = parseDate(today);
    return monthKey(d.getFullYear(), d.getMonth() + 1);
  }, [today]);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(today);

  const { year, monthNum } = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return { year: y, monthNum: m };
  }, [month]);

  const weekMiles = weekRunMiles(state.workouts, today);
  const monthMiles = monthRunMiles(state.workouts, year, monthNum);
  const dayWorkouts = workoutsForDate(state.workouts, selectedDate);

  async function deleteWorkout(id: string) {
    await post("/api/workouts", { action: "delete", id });
  }

  return (
    <main className="fade-in stack workouts-page">
      <header className="workouts-header">
        <Link href="/" className="tiny muted">
          ← Home
        </Link>
        <h1>Move</h1>
        <p className="muted">Run · Lift · HIIT · Stretch · Weights</p>
      </header>

      <section className="panel workout-stats-row">
        <div>
          <p className="eyebrow">This week</p>
          <p className="money">{formatMiles(weekMiles)} mi</p>
          <p className="tiny muted">Running</p>
        </div>
        <div>
          <p className="eyebrow">This month</p>
          <p className="money">{formatMiles(monthMiles)} mi</p>
          <p className="tiny muted">Running</p>
        </div>
      </section>

      <section className="panel">
        <WorkoutCalendar
          monthKey={month}
          today={today}
          workouts={state.workouts}
          selectedDate={selectedDate}
          onMonthChange={setMonth}
          onSelectDate={setSelectedDate}
        />
      </section>

      {selectedDate && (
        <section className="panel">
          <p className="eyebrow">Workouts on {selectedDate}</p>
          {dayWorkouts.length === 0 && (
            <p className="tiny muted">Nothing logged this day.</p>
          )}
          <ul className="workout-day-list">
            {dayWorkouts.map((w) => (
              <li key={w.id} className="workout-day-item">
                <div>
                  <span
                    className={`workout-day-badge ${w.category}`}
                  >
                    {w.category === "run"
                      ? "Run"
                      : liftTypeLabel(w.liftType)}
                  </span>
                  <strong>{w.label}</strong>
                  <p className="tiny muted">
                    {w.distanceMiles != null
                      ? `${formatMiles(w.distanceMiles)} mi · `
                      : ""}
                    {w.durationMin != null ? `${w.durationMin} min` : ""}
                    {w.notes ? ` · ${w.notes}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="dismiss-btn"
                  onClick={() => deleteWorkout(w.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <WorkoutLogForm date={selectedDate ?? today} />

      <WorkoutPrPanels date={selectedDate ?? today} />
    </main>
  );
}
