"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { WorkoutLogForm } from "@/components/workouts/WorkoutLogForm";
import { WorkoutRoutineBuilder } from "@/components/workouts/WorkoutRoutineBuilder";
import { WorkoutSummaryPanel } from "@/components/workouts/WorkoutSummaryPanel";
import {
  formatWorkoutListDate,
  monthKey,
  workoutsInMonth,
} from "@/lib/workouts";
import { parseDate } from "@/lib/journey";
import type { WorkoutType } from "@/lib/types";

export default function WorkoutsPage() {
  const { state, today, post } = useApp();
  const initialMonth = useMemo(() => {
    const d = parseDate(today);
    return monthKey(d.getFullYear(), d.getMonth() + 1);
  }, [today]);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(today);

  const monthWorkouts = workoutsInMonth(state.workouts, month);

  async function deleteWorkout(id: string) {
    await post("/api/workouts", { action: "delete", id });
  }

  return (
    <main className="fade-in stack workouts-page">
      <header className="workouts-header">
        <h1>Move</h1>
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

      <section className="panel workout-history-panel">
        {monthWorkouts.length === 0 ? (
          <p className="muted tiny">No workouts logged this month.</p>
        ) : (
          <ul className="workout-history-list">
            {monthWorkouts.map((w) => (
              <li
                key={w.id}
                className={`workout-history-row${w.date === selectedDate ? " selected" : ""}`}
              >
                <button
                  type="button"
                  className="workout-history-main"
                  onClick={() => setSelectedDate(w.date)}
                >
                  <span className="workout-history-date">
                    {formatWorkoutListDate(w.date)}
                  </span>
                  <span className="workout-history-label">
                    <span
                      className={`workout-history-dot ${w.type as WorkoutType}`}
                      aria-hidden
                    />
                    {w.label}
                  </span>
                </button>
                <button
                  type="button"
                  className="workout-history-remove"
                  aria-label={`Delete ${w.label}`}
                  onClick={() => void deleteWorkout(w.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WorkoutRoutineBuilder />

      <WorkoutLogForm date={selectedDate ?? today} />

      <WorkoutSummaryPanel monthKey={month} today={today} />
    </main>
  );
}
