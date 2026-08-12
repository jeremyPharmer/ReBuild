"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";

const INTERVENTIONS = [
  "Walk",
  "Shower",
  "Eat",
  "Exercise",
  "Leave environment",
  "Contact someone",
  "Journal",
  "Breathing",
  "Other",
];

export default function CravingPage() {
  const { post } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [intensity, setIntensity] = useState(5);
  const [situation, setSituation] = useState("");
  const [intervention, setIntervention] = useState("");
  const [cravingId, setCravingId] = useState("");
  const [after, setAfter] = useState(3);
  const [seconds, setSeconds] = useState(600);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    if (seconds <= 0) {
      setStep(3);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  async function startDelay() {
    setBusy(true);
    try {
      const data = (await post("/api/craving", {
        action: "start",
        intensityBefore: intensity,
        situation,
        intervention: "delay",
      })) as { craving: { id: string } };
      setCravingId(data.craving.id);
      setAfter((prev) => Math.min(prev, intensity));
      setSeconds(600);
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      const capped = Math.min(after, intensity);
      await post("/api/craving", {
        action: "complete",
        id: cravingId,
        intensityAfter: capped,
        outcome: intervention,
      });
      setAfter(capped);
      setStep(4);
    } finally {
      setBusy(false);
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <main className="stack fade-in">
      <p className="eyebrow">Support</p>
      <h1>I&apos;m having a craving</h1>

      {step === 0 && (
        <section className="panel">
          <ScaleInput
            label="Craving intensity"
            value={intensity}
            min={0}
            max={10}
            onChange={setIntensity}
          />
          <label className="field">
            <span className="field-label">Name the situation</span>
            <input
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="After work, alone, airport…"
            />
          </label>
          <PrimaryButton
            onClick={() => setStep(1)}
            disabled={!situation.trim()}
          >
            Continue
          </PrimaryButton>
        </section>
      )}

      {step === 1 && (
        <section className="panel">
          <h2>Delay the decision</h2>
          <p className="muted">
            Ten minutes. You don&apos;t have to decide yet.
          </p>
          <PrimaryButton onClick={startDelay} disabled={busy}>
            Start 10-minute delay
          </PrimaryButton>
          <div style={{ marginTop: 8 }}>
            <SecondaryButton onClick={() => router.push("/")}>
              Not now
            </SecondaryButton>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="panel success-pop">
          <p className="eyebrow">Waiting with you</p>
          <h1 style={{ fontVariantNumeric: "tabular-nums" }}>
            {mm}:{ss}
          </h1>
          <p className="muted">Breathe. The urge is information, not a command.</p>
          <SecondaryButton onClick={() => setStep(3)}>
            Skip to intervention
          </SecondaryButton>
        </section>
      )}

      {step === 3 && (
        <section className="panel">
          <p className="eyebrow">Choose an intervention</p>
          <div className="choice-row">
            {INTERVENTIONS.map((i) => (
              <button
                key={i}
                type="button"
                className={intervention === i ? "choice selected" : "choice"}
                onClick={() => setIntervention(i)}
              >
                {i}
              </button>
            ))}
          </div>
          <ScaleInput
            label="Craving now"
            value={Math.min(after, intensity)}
            min={0}
            max={intensity}
            onChange={(n) => setAfter(Math.min(n, intensity))}
          />
          <PrimaryButton
            onClick={finish}
            disabled={!intervention || busy}
          >
            Record outcome
          </PrimaryButton>
        </section>
      )}

      {step === 4 && (
        <section className="panel success-pop">
          <h2>Logged.</h2>
          <p className="muted">
            {intensity} → {after}. Your data will help you notice patterns later
            — not diagnose them.
          </p>
          <PrimaryButton onClick={() => router.push("/")}>Home</PrimaryButton>
        </section>
      )}
    </main>
  );
}
