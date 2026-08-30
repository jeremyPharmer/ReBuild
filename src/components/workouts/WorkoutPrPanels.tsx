"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { LiftType, WorkoutCategory, WorkoutPr } from "@/lib/types";
import { LIFT_TYPES, liftTypeLabel, prsForCategory } from "@/lib/workouts";

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
          {pr.liftType ? ` · ${liftTypeLabel(pr.liftType)}` : ""}
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

function PrAddForm({
  category,
  liftType,
  date,
}: {
  category: WorkoutCategory;
  liftType?: LiftType;
  date: string;
}) {
  const { post } = useApp();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState(category === "run" ? "min" : "lb");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !value) return;
    setBusy(true);
    try {
      await post("/api/workouts", {
        action: "set_pr",
        category,
        liftType,
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

  const runPrs = prsForCategory(prs, "run");

  return (
    <div className="workout-pr-stack">
      <section className="panel workout-pr-panel run-panel">
        <p className="eyebrow">Run PRs</p>
        <p className="tiny muted">Times, distances, weekly mileage bests</p>
        {runPrs.map((pr) => (
          <PrRow key={pr.id} pr={pr} onDelete={deletePr} />
        ))}
        {runPrs.length === 0 && (
          <p className="tiny muted">No run PRs yet.</p>
        )}
        <PrAddForm category="run" date={date} />
        <p className="tiny muted workout-mapmyrun-note">
          MapMyRun sync coming later — log miles here for now.
        </p>
      </section>

      <section className="panel workout-pr-panel lift-panel">
        <p className="eyebrow">Lift PRs</p>
        {LIFT_TYPES.map((t) => {
          const typePrs = prsForCategory(prs, "lift", t.id);
          return (
            <div key={t.id} className="workout-pr-lift-group">
              <h3>{t.label}</h3>
              {typePrs.map((pr) => (
                <PrRow key={pr.id} pr={pr} onDelete={deletePr} />
              ))}
              {typePrs.length === 0 && (
                <p className="tiny muted">No {t.label} PRs yet.</p>
              )}
              <PrAddForm category="lift" liftType={t.id} date={date} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
