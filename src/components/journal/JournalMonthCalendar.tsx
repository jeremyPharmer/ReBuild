"use client";

import {
  buildMonthGrid,
  monthLabel,
  parseMonthKey,
  shiftMonthKey,
} from "@/lib/workouts";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type JournalDayMark = "closed" | "missing" | "empty";

type Props = {
  monthKey: string;
  today: string;
  /** YYYY-MM-DD → closed / missing / empty */
  dayMarks: Map<string, JournalDayMark>;
  starredDays: Set<string>;
  selectedDate?: string | null;
  onMonthChange: (key: string) => void;
  onSelectDate: (date: string) => void;
};

export function JournalMonthCalendar({
  monthKey,
  today,
  dayMarks,
  starredDays,
  selectedDate,
  onMonthChange,
  onSelectDate,
}: Props) {
  const { year, month } = parseMonthKey(monthKey);
  const weeks = buildMonthGrid(year, month);

  return (
    <div className="fy-cal">
      <div className="fy-cal-nav">
        <button
          type="button"
          className="fy-journal-nav-btn"
          aria-label="Previous month"
          onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
        >
          ‹
        </button>
        <p className="fy-cal-title">{monthLabel(year, month)}</p>
        <button
          type="button"
          className="fy-journal-nav-btn"
          aria-label="Next month"
          onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
        >
          ›
        </button>
      </div>

      <div className="fy-cal-dow">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="fy-cal-grid">
        {weeks.flat().map((date, i) => {
          if (!date) {
            return <div key={`pad-${i}`} className="fy-cal-cell empty" />;
          }
          const mark = dayMarks.get(date) ?? "empty";
          const starred = starredDays.has(date);
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const dayNum = Number(date.slice(8));

          return (
            <button
              key={date}
              type="button"
              className={`fy-cal-cell mark-${mark}${starred ? " starred" : ""}${isToday ? " today" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => onSelectDate(date)}
              aria-label={`${date}${mark === "closed" ? ", written" : mark === "missing" ? ", not closed" : ""}${starred ? ", day to remember" : ""}`}
            >
              <span className="fy-cal-daynum">{dayNum}</span>
              <span className="fy-cal-markers" aria-hidden>
                {mark === "closed" && <span className="fy-cal-dot closed" />}
                {mark === "missing" && <span className="fy-cal-dot missing" />}
                {starred && <span className="fy-cal-star">★</span>}
              </span>
            </button>
          );
        })}
      </div>

      <p className="fy-cal-legend muted">
        <span>
          <span className="fy-cal-dot closed" /> written
        </span>
        <span>
          <span className="fy-cal-dot missing" /> open to close
        </span>
        <span>
          <span className="fy-cal-star">★</span> remember
        </span>
      </p>
    </div>
  );
}
