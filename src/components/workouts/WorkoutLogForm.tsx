"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { WorkoutType } from "@/lib/types";
import {
  gymSupportForType,
  WORKOUT_CUSTOM,
  WORKOUT_PRESETS,
  WORKOUT_QUALITY_MAX,
  WORKOUT_TYPES,
} from "@/lib/workouts";

const QUALITY_OPTIONS = Array.from(
  { length: WORKOUT_QUALITY_MAX },
  (_, i) => i + 1,
);

export function WorkoutLogForm({
  date,
  onLogged,
}: {
  date: string;
  onLogged?: () => void;
}) {
  const { post } = useApp();
  const [type, setType] = useState<WorkoutType>("run");
  const [workout, setWorkout] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [quality, setQuality] = useState<number | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isCustom = workout === WORKOUT_CUSTOM;
  const label = isCustom ? customLabel.trim() : workout.trim();
  const canSubmit = Boolean(label) && quality != null && !busy;

  useEffect(() => {
    setWorkout("");
    setCustomLabel("");
  }, [type]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label || quality == null) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/workouts", {
        action: "log",
        date,
        type,
        label,
        quality,
        distanceMiles: type === "run" && distance ? Number(distance) : undefined,
        durationMin: duration ? Number(duration) : undefined,
        notes: notes.trim() || undefined,
      });
      setWorkout("");
      setCustomLabel("");
      setQuality(null);
      setDistance("");
      setDuration("");
      setNotes("");
      onLogged?.();
      if (gymSupportForType(type)) {
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
    <form
      className="workout-log-form panel"
      onSubmit={submit}
      autoComplete="off"
    >
      <p className="eyebrow">Log workout</p>
      <p className="tiny muted workout-log-date">{date}</p>

      <fieldset className="workout-log-field">
        <legend className="workout-log-label">Type</legend>
        <div className="workout-type-segment" role="group" aria-label="Workout type">
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

      <label className="workout-log-field">
        <span className="workout-log-label">Workout</span>
        <select
          className="workout-log-select"
          value={workout}
          onChange={(e) => setWorkout(e.target.value)}
          aria-label="Choose workout"
          name="rebuild-workout-preset"
          autoComplete="off"
        >
          <option value="">Choose workout…</option>
          {WORKOUT_PRESETS[type].map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value={WORKOUT_CUSTOM}>Other…</option>
        </select>
      </label>

      {isCustom && (
        <label className="workout-log-field">
          <span className="workout-log-label">Custom name</span>
          <input
            className="workout-log-input"
            placeholder="Name this workout"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            aria-label="Custom workout name"
            name="rebuild-workout-custom"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
          />
        </label>
      )}

      <fieldset className="workout-log-field">
        <legend className="workout-log-label">Quality</legend>
        <div
          className="workout-quality-scale"
          role="group"
          aria-label="Workout quality 1 to 5"
        >
          {QUALITY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`workout-quality-btn${quality === n ? " active" : ""}`}
              onClick={() => setQuality(n)}
              aria-pressed={quality === n}
              aria-label={`Quality ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="tiny muted workout-quality-hint">
          1 = rough · 5 = great — adds to weekly points
        </p>
      </fieldset>

      <div
        className={`workout-log-metrics${type === "run" ? " has-miles" : ""}`}
      >
        {type === "run" && (
          <label className="workout-log-field">
            <span className="workout-log-label">Miles</span>
            <input
              className="workout-log-input"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              placeholder="0.0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              aria-label="Distance in miles"
              name="rebuild-workout-miles"
              autoComplete="off"
            />
          </label>
        )}
        <label className="workout-log-field">
          <span className="workout-log-label">Minutes</span>
          <input
            className="workout-log-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            placeholder="Optional"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-label="Duration in minutes"
            name="rebuild-workout-minutes"
            autoComplete="off"
          />
        </label>
      </div>

      <label className="workout-log-field">
        <span className="workout-log-label">Notes</span>
        <input
          className="workout-log-input"
          placeholder="Optional"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-label="Notes"
          name="rebuild-workout-notes"
          autoComplete="off"
        />
      </label>

      <button
        type="submit"
        className="btn primary workout-log-submit"
        disabled={!canSubmit}
      >
        {busy ? "Logging…" : "Log workout"}
      </button>

      {error && (
        <p className="tiny workout-log-error">{error}</p>
      )}
    </form>
  );
}
