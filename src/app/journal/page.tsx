"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";

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
  const { state } = useApp();

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

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Remember</p>
        <h1>Journal</h1>
        <p className="muted">One line a day · building toward 365 Lines</p>
      </header>

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
