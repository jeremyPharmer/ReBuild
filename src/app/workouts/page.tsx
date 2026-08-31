"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { WorkoutLogForm } from "@/components/workouts/WorkoutLogForm";
import { WorkoutSummaryPanel } from "@/components/workouts/WorkoutSummaryPanel";
import {
  formatMiles,
  monthKey,
  workoutTypeLabel,
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
        <p className="muted">Run · HIIT · Lift · Stretch</p>
      </header>

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
                  <span className={`workout-day-badge ${w.type}`}>
                    {workoutTypeLabel(w.type)}
                  </span>
                  <strong>{w.label}</strong>
                  <p className="tiny muted">
                    {w.quality != null ? `Q${w.quality}` : ""}
                    {w.quality != null &&
                    (w.distanceMiles != null || w.durationMin != null || w.notes)
                      ? " · "
                      : ""}
                    {w.distanceMiles != null
                      ? `${formatMiles(w.distanceMiles)} mi`
                      : ""}
                    {w.distanceMiles != null && w.durationMin != null
                      ? " · "
                      : ""}
                    {w.durationMin != null ? `${w.durationMin} min` : ""}
                    {(w.distanceMiles != null || w.durationMin != null) &&
                    w.notes
                      ? " · "
                      : ""}
                    {w.notes ? w.notes : ""}
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

      <WorkoutSummaryPanel monthKey={month} today={today} />
    </main>
  );
}
