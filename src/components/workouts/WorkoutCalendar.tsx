"use client";

import {
  buildMonthGrid,
  monthLabel,
  parseMonthKey,
  shiftMonthKey,
  summarizeDay,
  workoutsByDate,
  normalizeWorkouts,
  WORKOUT_TYPES,
} from "@/lib/workouts";
import type { WorkoutLog } from "@/lib/types";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  monthKey: string;
  today: string;
  workouts: WorkoutLog[] | undefined;
  selectedDate?: string | null;
  compact?: boolean;
  onMonthChange?: (key: string) => void;
  onSelectDate?: (date: string) => void;
};

export function WorkoutCalendar({
  monthKey,
  today,
  workouts,
  selectedDate,
  compact = false,
  onMonthChange,
  onSelectDate,
}: Props) {
  const { year, month } = parseMonthKey(monthKey);
  const weeks = buildMonthGrid(year, month);
  const byDate = workoutsByDate(normalizeWorkouts(workouts));

  return (
    <div className={`workout-cal${compact ? " workout-cal-compact" : ""}`}>
      <div className="workout-cal-nav">
        {onMonthChange ? (
          <>
            <button
              type="button"
              className="btn ghost workout-cal-arrow"
              aria-label="Previous month"
              onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
            >
              ‹
            </button>
            <p className="workout-cal-title">{monthLabel(year, month)}</p>
            <button
              type="button"
              className="btn ghost workout-cal-arrow"
              aria-label="Next month"
              onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
            >
              ›
            </button>
          </>
        ) : (
          <p className="workout-cal-title">{monthLabel(year, month)}</p>
        )}
      </div>

      <div className="workout-cal-dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="workout-cal-grid">
        {weeks.flat().map((date, i) => {
          if (!date) {
            return <div key={`pad-${i}`} className="workout-cal-cell empty" />;
          }
          const dayWorkouts = byDate.get(date) ?? [];
          const summary = summarizeDay(dayWorkouts);
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const dayNum = Number(date.slice(8));

          return (
            <button
              key={date}
              type="button"
              className={`workout-cal-cell${isToday ? " today" : ""}${isSelected ? " selected" : ""}${dayWorkouts.length ? " has-work" : ""}`}
              onClick={() => onSelectDate?.(date)}
              disabled={!onSelectDate}
              aria-label={`${date}${dayWorkouts.length ? `, ${dayWorkouts.length} workouts` : ""}`}
            >
              <span className="workout-cal-daynum">{dayNum}</span>
              <span className="workout-cal-markers" aria-hidden>
                {summary.types.map((t) => (
                  <span key={t} className={`workout-marker ${t}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="workout-cal-legend">
        {WORKOUT_TYPES.map((t) => (
          <span key={t.id}>
            <span className={`workout-marker ${t.id}`} /> {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
