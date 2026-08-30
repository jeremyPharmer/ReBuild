"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { LiftType, WorkoutCategory } from "@/lib/types";
import { LIFT_TYPES } from "@/lib/workouts";

export function WorkoutLogForm({
  date,
  onLogged,
}: {
  date: string;
  onLogged?: () => void;
}) {
  const { post } = useApp();
  const [category, setCategory] = useState<WorkoutCategory>("run");
  const [liftType, setLiftType] = useState<LiftType>("weights");
  const [label, setLabel] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/workouts", {
        action: "log",
        date,
        category,
        liftType: category === "lift" ? liftType : undefined,
        label: trimmed,
        distanceMiles:
          category === "run" && distance ? Number(distance) : undefined,
        durationMin: duration ? Number(duration) : undefined,
        notes: notes.trim() || undefined,
      });
      setLabel("");
      setDistance("");
      setDuration("");
      setNotes("");
      onLogged?.();
      if (category === "lift") {
        await post("/api/support", {
          date,
          supportType: "gym",
          completed: true,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log workout");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="workout-log-form panel" onSubmit={submit}>
      <p className="eyebrow">Log workout</p>
      <p className="tiny muted" style={{ marginBottom: 10 }}>
        {date}
      </p>

      <div className="workout-category-toggle">
        <button
          type="button"
          className={`workout-cat-btn run${category === "run" ? " active" : ""}`}
          onClick={() => setCategory("run")}
        >
          Run
        </button>
        <button
          type="button"
          className={`workout-cat-btn lift${category === "lift" ? " active" : ""}`}
          onClick={() => setCategory("lift")}
        >
          Lift
        </button>
      </div>

      {category === "lift" && (
        <div className="workout-lift-types">
          {LIFT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`btn ghost workout-lift-btn${liftType === t.id ? " active" : ""}`}
              onClick={() => setLiftType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <input
        className="gym-log-input"
        placeholder={
          category === "run" ? "Run — e.g. Easy 5K, Long run" : "Workout name"
        }
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        aria-label="Workout label"
      />

      <div className="gym-log-row">
        {category === "run" && (
          <input
            className="gym-log-input"
            type="number"
            step="0.1"
            min={0}
            placeholder="Miles"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            aria-label="Distance in miles"
          />
        )}
        <input
          className="gym-log-input gym-log-duration"
          type="number"
          min={1}
          max={600}
          placeholder="Min"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          aria-label="Duration in minutes"
        />
        <button
          type="submit"
          className="btn primary gym-log-btn"
          disabled={busy || !label.trim()}
        >
          {busy ? "…" : "Log"}
        </button>
      </div>

      <input
        className="gym-log-input"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label="Notes"
      />

      {error && (
        <p className="tiny" style={{ color: "var(--danger)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </form>
  );
}
