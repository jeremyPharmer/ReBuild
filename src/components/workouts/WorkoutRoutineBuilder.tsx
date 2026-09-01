"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { WorkoutRoutine, WorkoutType } from "@/lib/types";
import {
  normalizeRoutines,
  workoutTypeLabel,
  WORKOUT_TYPES,
} from "@/lib/workouts";

type DraftExercise = {
  key: string;
  id?: string;
  name: string;
  sets: string;
  reps: string;
  tracksWeight: boolean;
};

function emptyExercise(): DraftExercise {
  return {
    key: `new_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    sets: "3",
    reps: "10",
    tracksWeight: false,
  };
}

function draftFromRoutine(r: WorkoutRoutine): {
  id: string;
  name: string;
  type: WorkoutType;
  exercises: DraftExercise[];
} {
  return {
    id: r.id,
    name: r.name,
    type: r.type!,
    exercises: r.exercises.map((ex) => ({
      key: ex.id,
      id: ex.id,
      name: ex.name,
      sets: String(ex.sets),
      reps: String(ex.reps),
      tracksWeight: ex.tracksWeight,
    })),
  };
}

export function WorkoutRoutineBuilder() {
  const { state, post } = useApp();
  const routines = normalizeRoutines(state.workoutRoutines);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<WorkoutType>("lift");
  const [exercises, setExercises] = useState<DraftExercise[]>([emptyExercise()]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setEditingId(null);
    setName("");
    setType("lift");
    setExercises([emptyExercise()]);
    setError("");
  }

  function startEdit(r: WorkoutRoutine) {
    const d = draftFromRoutine(r);
    setEditingId(d.id);
    setName(d.name);
    setType(d.type);
    setExercises(d.exercises.length ? d.exercises : [emptyExercise()]);
    setOpen(true);
    setError("");
  }

  function updateExercise(key: string, patch: Partial<DraftExercise>) {
    setExercises((prev) =>
      prev.map((ex) => (ex.key === key ? { ...ex, ...patch } : ex)),
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const parsed = exercises
      .map((ex) => ({
        id: ex.id,
        name: ex.name.trim(),
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        tracksWeight: ex.tracksWeight,
      }))
      .filter((ex) => ex.name);
    if (!trimmed || parsed.length === 0) {
      setError("Name and at least one exercise required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await post("/api/workouts", {
        action: "save_routine",
        id: editingId || undefined,
        name: trimmed,
        type,
        exercises: parsed,
      });
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save routine");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await post("/api/workouts", { action: "delete_routine", id });
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel workout-routine-panel">
      <div className="workout-routine-head">
        <p className="eyebrow">Routines</p>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            if (open) {
              setOpen(false);
              resetForm();
            } else {
              resetForm();
              setOpen(true);
            }
          }}
        >
          {open ? "Cancel" : "New routine"}
        </button>
      </div>

      {routines.length > 0 && (
        <ul className="workout-routine-list">
          {routines.map((r) => (
            <li key={r.id} className="workout-routine-item">
              <div>
                <span className={`workout-day-badge ${r.type}`}>
                  {workoutTypeLabel(r.type)}
                </span>
                <strong>{r.name}</strong>
                <p className="tiny muted">
                  {r.exercises.length} exercise
                  {r.exercises.length === 1 ? "" : "s"}
                  {r.exercises.some((ex) => ex.tracksWeight)
                    ? " · tracks weight"
                    : ""}
                </p>
              </div>
              <div className="workout-routine-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => startEdit(r)}
                  disabled={busy}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="dismiss-btn"
                  onClick={() => remove(r.id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {routines.length === 0 && !open && (
        <p className="tiny muted">No saved routines yet.</p>
      )}

      {open && (
        <form
          className="workout-routine-form"
          onSubmit={save}
          autoComplete="off"
        >
          <p className="workout-log-label">
            {editingId ? "Edit routine" : "New routine"}
          </p>

          <label className="workout-log-field">
            <span className="workout-log-label">Name</span>
            <input
              className="workout-log-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning stretch"
              aria-label="Routine name"
              name="rebuild-routine-name"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
            />
          </label>

          <fieldset className="workout-log-field">
            <legend className="workout-log-label">Type</legend>
            <div
              className="workout-type-segment"
              role="group"
              aria-label="Routine type"
            >
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`workout-type-seg ${t.id}${type === t.id ? " active" : ""}`}
                  onClick={() => setType(t.id)}
                  aria-pressed={type === t.id}
                >
                  <span className={`workout-marker ${t.id}`} aria-hidden />
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="workout-routine-exercises">
            <p className="workout-log-label">Exercises</p>
            {exercises.map((ex, i) => (
              <div key={ex.key} className="workout-routine-ex-row">
                <label className="workout-log-field workout-routine-ex-name">
                  <span className="workout-log-label">Exercise {i + 1}</span>
                  <input
                    className="workout-log-input"
                    value={ex.name}
                    onChange={(e) =>
                      updateExercise(ex.key, { name: e.target.value })
                    }
                    placeholder="Name"
                    aria-label={`Exercise ${i + 1} name`}
                    autoComplete="off"
                  />
                </label>
                <label className="workout-log-field">
                  <span className="workout-log-label">Sets</span>
                  <input
                    className="workout-log-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={99}
                    value={ex.sets}
                    onChange={(e) =>
                      updateExercise(ex.key, { sets: e.target.value })
                    }
                    aria-label={`Exercise ${i + 1} sets`}
                  />
                </label>
                <label className="workout-log-field">
                  <span className="workout-log-label">Reps</span>
                  <input
                    className="workout-log-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={99}
                    value={ex.reps}
                    onChange={(e) =>
                      updateExercise(ex.key, { reps: e.target.value })
                    }
                    aria-label={`Exercise ${i + 1} reps`}
                  />
                </label>
                <label className="workout-routine-weight-toggle">
                  <input
                    type="checkbox"
                    checked={ex.tracksWeight}
                    onChange={(e) =>
                      updateExercise(ex.key, {
                        tracksWeight: e.target.checked,
                      })
                    }
                  />
                  <span>Track weight</span>
                </label>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    className="dismiss-btn"
                    onClick={() =>
                      setExercises((prev) =>
                        prev.filter((row) => row.key !== ex.key),
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn secondary"
              onClick={() => setExercises((prev) => [...prev, emptyExercise()])}
            >
              Add exercise
            </button>
          </div>

          <button
            type="submit"
            className="btn primary"
            disabled={busy}
          >
            {busy ? "Saving…" : editingId ? "Update routine" : "Save routine"}
          </button>
          {error && <p className="tiny workout-log-error">{error}</p>}
        </form>
      )}
    </section>
  );
}
