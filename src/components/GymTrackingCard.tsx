"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { weekBounds } from "@/lib/journey";
import { recentWorkouts, workoutsForDate } from "@/lib/workouts";

export function GymTrackingCard() {
  const { state, dashboard, today, post } = useApp();
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const gymSupport = state.profile?.supports.find((s) => s.type === "gym");
  const weekRow = dashboard?.week.find((w) => w.type === "gym");
  const weekDone = weekRow?.done ?? 0;
  const weekTarget = gymSupport?.weeklyTarget ?? 4;
  const { start, end } = weekBounds(today);
  const weekWorkouts = (state.workouts ?? []).filter(
    (w) => w.date >= start && w.date <= end,
  ).length;

  const todayWorkouts = workoutsForDate(state.workouts, today);
  const recent = recentWorkouts(state.workouts, 3);
  const gymDone = Boolean(
    dashboard?.todaySupports.some(
      (s) => s.supportType === "gym" && s.completed,
    ),
  );
  const gymSkipped = dashboard?.todaySkips?.includes("gym");

  async function logWorkout(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/workouts", {
        action: "log",
        date: today,
        label: trimmed,
        durationMin: duration ? Number(duration) : undefined,
      });
      setLabel("");
      setDuration("");
      if (!gymDone && !gymSkipped) {
        await post("/api/support", {
          date: today,
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
    <section className="home-card home-card-gym">
      <div className="home-card-head">
        <p className="home-card-kicker">Move</p>
        <h2>Gym log</h2>
        <p className="tiny home-card-sub">
          {weekDone}/{weekTarget} supports · {weekWorkouts} logged this week
        </p>
      </div>

      {todayWorkouts.length > 0 && (
        <ul className="gym-today-list">
          {todayWorkouts.map((w) => (
            <li key={w.id} className="tiny">
              {w.label}
              {w.durationMin ? ` · ${w.durationMin} min` : ""}
            </li>
          ))}
        </ul>
      )}

      <form className="gym-log-form" onSubmit={logWorkout}>
        <input
          className="gym-log-input"
          placeholder="Workout — e.g. Lift, run, class"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          aria-label="Workout label"
        />
        <div className="gym-log-row">
          <input
            className="gym-log-input gym-log-duration"
            type="number"
            min={1}
            max={300}
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
      </form>

      {recent.length > 0 && (
        <div className="gym-recent">
          <p className="tiny" style={{ marginBottom: 6 }}>
            Recent
          </p>
          <ul className="gym-recent-list">
            {recent.map((w) => (
              <li key={w.id} className="tiny muted">
                {w.date.slice(5).replace("-", "/")} · {w.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="tiny" style={{ color: "var(--danger)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </section>
  );
}
