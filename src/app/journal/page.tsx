"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  formatDisplayDate,
  missingEveningDates,
} from "@/lib/journey";

type DayRow = {
  date: string;
  oneLine?: string;
  standOut?: string;
  other: { id: string; type: string; text: string }[];
};

function formatMd(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

function JournalDayRow({ day }: { day: DayRow }) {
  const extras = [
    ...(day.standOut
      ? [{ id: "standout", label: "Note", text: day.standOut }]
      : []),
    ...day.other.map((o) => ({
      id: o.id,
      label: o.type,
      text: o.text,
    })),
  ];
  const [open, setOpen] = useState(false);
  const headline = day.oneLine?.trim() || extras[0]?.text || "—";

  return (
    <div className="support-row journal-day-row">
      <button
        type="button"
        className="journal-day-toggle"
        aria-expanded={extras.length > 0 ? open : undefined}
        onClick={() => extras.length > 0 && setOpen((v) => !v)}
        disabled={extras.length === 0}
      >
        <div className="journal-day-toggle-main">
          <p className="tiny">{formatMd(day.date)}</p>
          <p className="journal-day-headline">{headline}</p>
        </div>
        {extras.length > 0 && (
          <span className={open ? "caret open" : "caret"} aria-hidden>
            ▾
          </span>
        )}
      </button>
      {open && extras.length > 0 && (
        <div className="journal-day-notes fade-in">
          {extras.map((e) => (
            <p key={e.id} className="journal-day-note">
              <span className="tiny">{e.label}</span>
              {e.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const { state, today } = useApp();

  const days = useMemo(() => {
    const byDate = new Map<string, DayRow>();
    for (const j of state.journals) {
      const row = byDate.get(j.date) ?? {
        date: j.date,
        other: [],
      };
      if (j.type === "one_line") {
        row.oneLine = j.text;
      } else if (j.type === "journal") {
        row.standOut = j.text;
      } else {
        row.other.push({ id: j.id, type: j.type, text: j.text });
      }
      byDate.set(j.date, row);
    }
    return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [state.journals]);

  /** Past days only — today is still open for Close the day, not a “missed” task. */
  const missed = useMemo(() => {
    if (!today) return [];
    return missingEveningDates(state, today).filter((d) => d < today);
  }, [state, today]);

  return (
    <main className="stack fade-in journal-page">
      <header>
        <p className="eyebrow">Remember</p>
        <h1>Journal</h1>
        <p className="muted">One line a day · building toward 365 Lines</p>
      </header>

      {missed.length > 0 && (
        <section className="panel journal-tasks">
          <div className="journal-tasks-head">
            <div>
              <p className="eyebrow">To do</p>
              <h2 className="journal-tasks-title">Missed journal entries</h2>
            </div>
            <span className="journal-tasks-count">{missed.length}</span>
          </div>
          <p className="tiny journal-tasks-hint">
            Open days still waiting for a line — tap to catch up.
          </p>
          <ul className="journal-task-list">
            {missed.map((d) => (
              <li key={d}>
                <Link
                  href={`/evening?date=${d}`}
                  className="journal-task-item"
                >
                  <span className="journal-task-box" aria-hidden />
                  <span className="journal-task-copy">
                    <span className="journal-task-date">
                      {formatDisplayDate(d)}
                    </span>
                    <span className="tiny">Write your line</span>
                  </span>
                  <span className="journal-task-go" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <p className="eyebrow">365 lines</p>
        {days.length === 0 && (
          <p className="muted">Close a day to add your first line.</p>
        )}
        {days.map((d) => (
          <JournalDayRow key={d.date} day={d} />
        ))}
      </section>
    </main>
  );
}
