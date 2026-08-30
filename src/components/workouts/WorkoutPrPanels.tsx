"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { WorkoutPr, WorkoutType } from "@/lib/types";
import { prsForType, WORKOUT_TYPES } from "@/lib/workouts";

function PrRow({
  pr,
  onDelete,
}: {
  pr: WorkoutPr;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="workout-pr-row">
      <div>
        <strong>{pr.name}</strong>
        <p className="tiny muted">
          {pr.value} {pr.unit} · {pr.date.slice(5).replace("-", "/")}
        </p>
      </div>
      <button
        type="button"
        className="dismiss-btn"
        onClick={() => onDelete(pr.id)}
      >
        Remove
      </button>
    </div>
  );
}

function PrAddForm({ type, date }: { type: WorkoutType; date: string }) {
  const { post } = useApp();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState(
    type === "run" ? "min" : type === "lift" ? "lb" : "min",
  );
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !value) return;
    setBusy(true);
    try {
      await post("/api/workouts", {
        action: "set_pr",
        type,
        name: name.trim(),
        value: Number(value),
        unit,
        date,
      });
      setName("");
      setValue("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="workout-pr-add" onSubmit={submit}>
      <input
        className="gym-log-input"
        placeholder="PR name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gym-log-row">
        <input
          className="gym-log-input"
          type="number"
          step="any"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <input
          className="gym-log-input gym-log-duration"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
        <button type="submit" className="btn ghost gym-log-btn" disabled={busy}>
          Add
        </button>
      </div>
    </form>
  );
}

export function WorkoutPrPanels({ date }: { date: string }) {
  const { state, post } = useApp();
  const prs = state.workoutPrs ?? [];

  async function deletePr(id: string) {
    await post("/api/workouts", { action: "delete_pr", id });
  }

  return (
    <div className="workout-pr-stack">
      {WORKOUT_TYPES.map((t) => {
        const typePrs = prsForType(prs, t.id);
        return (
          <section
            key={t.id}
            className={`panel workout-pr-panel ${t.id}-panel`}
          >
            <p className="eyebrow">{t.label} PRs</p>
            {typePrs.map((pr) => (
              <PrRow key={pr.id} pr={pr} onDelete={deletePr} />
            ))}
            {typePrs.length === 0 && (
              <p className="tiny muted">No {t.label} PRs yet.</p>
            )}
            <PrAddForm type={t.id} date={date} />
            {t.id === "run" && (
              <p className="tiny muted workout-mapmyrun-note">
                MapMyRun sync coming later — log miles here for now.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
