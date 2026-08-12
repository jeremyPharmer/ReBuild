"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";

type DayRow = {
  date: string;
  oneLine?: string;
  standOut?: string;
  other: { id: string; type: string; text: string }[];
};

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
          <div key={d.date} className="support-row">
            <p className="tiny">{d.date}</p>
            {d.oneLine && (
              <p style={{ margin: "4px 0 0", fontSize: "1.05rem" }}>
                {d.oneLine}
              </p>
            )}
            {d.standOut && (
              <p
                className="muted"
                style={{ margin: "6px 0 0", lineHeight: 1.45 }}
              >
                {d.standOut}
              </p>
            )}
            {d.other.map((o) => (
              <p key={o.id} className="tiny" style={{ marginTop: 6 }}>
                {o.type}: {o.text}
              </p>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
