"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { WorkoutRoutine, WorkoutType } from "@/lib/types";
import { normalizeRoutines, WORKOUT_TYPES } from "@/lib/workouts";

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

  function startCreate() {
    resetForm();
    setOpen(true);
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

  function closeForm() {
    setOpen(false);
    resetForm();
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
      closeForm();
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
      if (editingId === id) closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel workout-routine-panel">
      <div className="workout-routine-head">
        <p className="eyebrow" style={{ marginBottom: 0 }}>
          Create routine
        </p>
        {!open && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Create a routine"
            onClick={startCreate}
          >
            +
          </button>
        )}
      </div>

      {routines.length > 0 && !open && (
        <ul className="workout-routine-list">
          {routines.map((r) => (
            <li key={r.id} className="workout-routine-row">
              <button
                type="button"
                className="workout-routine-main"
                disabled={busy}
                onClick={() => startEdit(r)}
              >
                <span className="workout-history-line">
                  <span
                    className={`workout-history-dot ${r.type}`}
                    aria-hidden
                  />
                  {r.name}
                </span>
                <span className="workout-routine-meta tiny muted">
                  {r.exercises.length} exercise
                  {r.exercises.length === 1 ? "" : "s"}
                  {r.exercises.some((ex) => ex.tracksWeight)
                    ? " · tracks weight"
                    : ""}
                </span>
              </button>
              <button
                type="button"
                className="workout-history-remove"
                aria-label={`Delete ${r.name}`}
                disabled={busy}
                onClick={() => void remove(r.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {routines.length === 0 && !open && (
        <p className="muted tiny workout-routine-empty">
          No saved routines yet. Tap + to create one.
        </p>
      )}

      {open && (
        <form
          className="workout-routine-form workout-log-form"
          onSubmit={save}
          autoComplete="off"
        >
          <label className="workout-log-field">
            <span className="workout-log-label">Routine name</span>
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
              className="workout-type-segment workout-type-segment-compact"
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
              <div key={ex.key} className="workout-routine-ex-card">
                <div className="workout-routine-ex-head">
                  <span className="workout-log-label">Exercise {i + 1}</span>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className="workout-routine-inline-btn"
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
                <label className="workout-log-field">
                  <span className="workout-log-label">Name</span>
                  <input
                    className="workout-log-input"
                    value={ex.name}
                    onChange={(e) =>
                      updateExercise(ex.key, { name: e.target.value })
                    }
                    placeholder="Exercise name"
                    aria-label={`Exercise ${i + 1} name`}
                    autoComplete="off"
                  />
                </label>
                <div className="workout-routine-ex-metrics">
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
                </div>
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
                  <span>Track weight when logging</span>
                </label>
              </div>
            ))}
            <button
              type="button"
              className="workout-routine-inline-btn"
              onClick={() => setExercises((prev) => [...prev, emptyExercise()])}
            >
              + Add exercise
            </button>
          </div>

          <div className="workout-routine-form-actions">
            <button
              type="button"
              className="workout-routine-inline-btn"
              onClick={closeForm}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary workout-routine-save"
              disabled={busy}
            >
              {busy ? "Saving…" : editingId ? "Update routine" : "Save routine"}
            </button>
          </div>

          {error && <p className="tiny workout-log-error">{error}</p>}
        </form>
      )}
    </section>
  );
}
