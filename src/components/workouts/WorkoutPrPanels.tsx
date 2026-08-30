"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { WorkoutPr, WorkoutType } from "@/lib/types";
import {
  normalizeWorkoutPrs,
  prsForType,
  workoutTypeLabel,
  WORKOUT_TYPES,
} from "@/lib/workouts";

const GYM_TYPES = WORKOUT_TYPES.filter((t) => t.id !== "run");

function PrRow({
  pr,
  onDelete,
  showType,
}: {
  pr: WorkoutPr;
  onDelete: (id: string) => void;
  showType?: boolean;
}) {
  return (
    <div className="workout-pr-row">
      <div>
        <strong>
          {showType && pr.type && (
            <span className={`workout-day-badge ${pr.type}`}>
              {workoutTypeLabel(pr.type)}
            </span>
          )}
          {pr.name}
        </strong>
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

function PrAddForm({
  type,
  date,
  onTypeChange,
  allowTypePick,
}: {
  type: WorkoutType;
  date: string;
  onTypeChange?: (type: WorkoutType) => void;
  allowTypePick?: boolean;
}) {
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
      {allowTypePick && onTypeChange && (
        <div className="workout-pr-type-row" role="group" aria-label="PR type">
          {GYM_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`workout-pr-type-btn ${t.id}${type === t.id ? " active" : ""}`}
              onClick={() => {
                onTypeChange(t.id);
                setUnit(t.id === "lift" ? "lb" : "min");
              }}
              aria-pressed={type === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
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
  const prs = normalizeWorkoutPrs(state.workoutPrs);
  const [gymType, setGymType] = useState<WorkoutType>("lift");

  const runPrs = prsForType(prs, "run");
  const gymPrs = prs
    .filter((p) => p.type && p.type !== "run")
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );

  async function deletePr(id: string) {
    await post("/api/workouts", { action: "delete_pr", id });
  }

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
        <PrAddForm type="run" date={date} />
        <p className="tiny muted workout-mapmyrun-note">
          MapMyRun sync coming later — log miles here for now.
        </p>
      </section>

      <section className="panel workout-pr-panel gym-panel">
        <p className="eyebrow">Gym PRs</p>
        <p className="tiny muted">HIIT · Lift · Stretch</p>
        {gymPrs.map((pr) => (
          <PrRow key={pr.id} pr={pr} onDelete={deletePr} showType />
        ))}
        {gymPrs.length === 0 && (
          <p className="tiny muted">No gym PRs yet.</p>
        )}
        <PrAddForm
          type={gymType}
          date={date}
          allowTypePick
          onTypeChange={setGymType}
        />
      </section>
    </div>
  );
}
