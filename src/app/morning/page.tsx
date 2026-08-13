"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";
import { Money } from "@/components/ui";
import { waitingReclaimTotal } from "@/lib/journey";

export default function MorningPage() {
  const { post, state, dashboard, today } = useApp();
  const router = useRouter();
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(5);
  const [intention, setIntention] = useState("");
  const [trigger, setTrigger] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await post("/api/morning", {
        date: today,
        sleepHours,
        sleepQuality,
        mood,
        energy,
        stress,
        intention,
        trigger: trigger || undefined,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (state.mornings.some((m) => m.date === today) && !done) {
    return (
      <main className="stack">
        <p className="eyebrow">Start the day</p>
        <h1>Already complete</h1>
        <SecondaryButton onClick={() => router.push("/")}>
          Back home
        </SecondaryButton>
      </main>
    );
  }

  if (done) {
    const waiting = waitingReclaimTotal(state);
    return (
      <main className="stack fade-in">
        <p className="eyebrow">Today&apos;s Rebuild</p>
        <h1>Set yourself up.</h1>
        <div className="panel list-check">
          {state.profile?.supports
            .filter((s) => s.enabled)
            .map((s) => (
              <div key={s.type} className="check-item">
                <span className="check-box" />
                <div>
                  <strong>{s.label}</strong>
                  <p className="tiny">Log on Plan when done</p>
                </div>
              </div>
            ))}
          <div className="check-item">
            <span className="check-box" />
            <div>
              <strong>Money</strong>
              <p className="tiny">
                <Money value={waiting} /> ready to reclaim this evening
              </p>
            </div>
          </div>
        </div>
        {intention && (
          <div className="panel">
            <p className="eyebrow">Today&apos;s intention</p>
            <p style={{ margin: 0, fontSize: "1.15rem" }}>{intention}</p>
          </div>
        )}
        <PrimaryButton onClick={() => router.push("/")}>
          Into the day
        </PrimaryButton>
      </main>
    );
  }

  return (
    <main className="stack fade-in">
      <p className="eyebrow">Prepare</p>
      <h1>Start the day</h1>
      <p className="muted">About 2–4 minutes. Not a medical form.</p>

      <section className="panel">
        <p className="eyebrow">Sleep</p>
        <ScaleInput
          label="Hours slept"
          value={sleepHours}
          min={0}
          max={14}
          step={0.5}
          onChange={setSleepHours}
        />
        <ScaleInput
          label="Sleep quality"
          value={sleepQuality}
          onChange={setSleepQuality}
        />
      </section>

      <section className="panel">
        <p className="eyebrow">Current state</p>
        <ScaleInput label="Mood" value={mood} onChange={setMood} />
        <ScaleInput label="Energy" value={energy} onChange={setEnergy} />
        <ScaleInput label="Stress" value={stress} onChange={setStress} />
      </section>

      <section className="panel">
        <p className="eyebrow">Alignment</p>
        <label className="field">
          <span className="field-label">Any trigger or concern?</span>
          <input
            type="text"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="field">
          <span className="field-label">
            What&apos;s the one thing you want to do well today?
          </span>
          <input
            type="text"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="One short line"
          />
        </label>
      </section>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <PrimaryButton onClick={submit} disabled={busy || !intention.trim()}>
        {busy ? "Saving…" : "Continue"}
      </PrimaryButton>
      <SecondaryButton onClick={() => router.push("/")}>Cancel</SecondaryButton>
      {dashboard && (
        <p className="tiny" style={{ textAlign: "center" }}>
          {dashboard.label}
        </p>
      )}
    </main>
  );
}
