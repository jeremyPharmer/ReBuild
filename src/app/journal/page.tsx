"use client";

import { useApp } from "@/components/AppProvider";

export default function JournalPage() {
  const { state } = useApp();
  const lines = [...state.journals]
    .filter((j) => j.type === "one_line")
    .sort((a, b) => b.date.localeCompare(a.date));
  const longer = [...state.journals]
    .filter((j) => j.type !== "one_line")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Remember</p>
        <h1>Journal</h1>
        <p className="muted">One line a day · building toward 365 Lines</p>
      </header>

      <section className="panel">
        <p className="eyebrow">365 lines</p>
        {lines.length === 0 && (
          <p className="muted">Close a day to add your first line.</p>
        )}
        {lines.map((j) => (
          <div key={j.id} className="support-row">
            <p className="tiny">{j.date}</p>
            <p style={{ margin: "4px 0 0", fontSize: "1.05rem" }}>{j.text}</p>
          </div>
        ))}
      </section>

      {longer.length > 0 && (
        <section className="panel">
          <p className="eyebrow">Longer notes</p>
          {longer.map((j) => (
            <div key={j.id} className="support-row">
              <p className="tiny">
                {j.date} · {j.type}
              </p>
              <p style={{ margin: "4px 0 0" }}>{j.text}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
