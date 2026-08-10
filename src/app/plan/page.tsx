"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, ProgressBar, SecondaryButton } from "@/components/ui";
import { formatDisplayDate, weekBounds, weeklySupportProgress } from "@/lib/journey";
import type { SupportType } from "@/lib/types";

export default function PlanPage() {
  const { state, today, post } = useApp();
  const week = weeklySupportProgress(state, today);
  const { start, end } = weekBounds(today);
  const [contentNote, setContentNote] = useState("");
  const [pendingContent, setPendingContent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function toggleSupport(type: SupportType, currentlyDone: boolean) {
    if (type === "recovery_content" && !currentlyDone) {
      setPendingContent(true);
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: !currentlyDone,
      });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmContent() {
    setBusy(true);
    try {
      await post("/api/support", {
        date: today,
        supportType: "recovery_content",
        completed: true,
        actionNote: contentNote || undefined,
      });
      setPendingContent(false);
      setContentNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Rebuild supports</p>
        <h1>This week</h1>
        <p className="muted">
          {formatDisplayDate(start)} – {formatDisplayDate(end)} · targets, not
          judgments
        </p>
      </header>

      <section className="panel">
        {week.map((w) => {
          const doneToday = state.supports.some(
            (s) =>
              s.date === today && s.supportType === w.type && s.completed,
          );
          return (
            <div key={w.type} className="support-row">
              <div className="row">
                <div>
                  <strong>{w.label}</strong>
                  <p className="tiny">
                    {w.done} / {w.target} this week
                  </p>
                </div>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={busy}
                  onClick={() => toggleSupport(w.type, doneToday)}
                >
                  {doneToday ? "Undo today" : "Done today"}
                </button>
              </div>
              <ProgressBar done={w.done} target={w.target} />
            </div>
          );
        })}
        {week.every((w) => w.done >= w.target) && (
          <p className="chip good" style={{ marginTop: 12 }}>
            Strong week — all supports hit. $25 treat gift unlocks.
          </p>
        )}
      </section>

      {pendingContent && (
        <section className="panel">
          <p className="eyebrow">Recovery content</p>
          <h2>What will you do differently?</h2>
          <p className="muted">
            One short note so content doesn&apos;t become avoidance.
          </p>
          <label className="field">
            <span className="field-label">Because of what I consumed…</span>
            <input
              value={contentNote}
              onChange={(e) => setContentNote(e.target.value)}
              placeholder="I'll walk after dinner / call a friend…"
            />
          </label>
          <PrimaryButton onClick={confirmContent} disabled={busy}>
            Log content
          </PrimaryButton>
          <div style={{ marginTop: 8 }}>
            <SecondaryButton onClick={() => setPendingContent(false)}>
              Cancel
            </SecondaryButton>
          </div>
        </section>
      )}

      {msg && <p style={{ color: "var(--danger)" }}>{msg}</p>}

      <section className="panel">
        <p className="eyebrow">Today&apos;s logged notes</p>
        {state.supports
          .filter((s) => s.date === today && s.actionNote)
          .map((s) => (
            <p key={s.supportType} className="tiny">
              {s.supportType}: {s.actionNote}
            </p>
          ))}
        {state.supports.filter((s) => s.date === today && s.actionNote)
          .length === 0 && <p className="muted">No content reflections yet.</p>}
      </section>
    </main>
  );
}
