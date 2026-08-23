"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { cravingInterventionOptions } from "@/lib/craving-interventions";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";

type Path = "timer" | "intervention";

export default function CravingPage() {
  const { state, post } = useApp();
  const router = useRouter();
  const interventions = useMemo(
    () => cravingInterventionOptions(state.profile),
    [state.profile],
  );

  const [step, setStep] = useState(0);
  const [path, setPath] = useState<Path | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [situation, setSituation] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [cravingId, setCravingId] = useState("");
  const [after, setAfter] = useState(3);
  const [seconds, setSeconds] = useState(600);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step !== 2 || path !== "timer") return;
    if (seconds <= 0) {
      setStep(3);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds, path]);

  function toggleIntervention(label: string) {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label],
    );
  }

  async function startTimer() {
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
      setPath("timer");
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function beginInterventionPath() {
    setBusy(true);
    try {
      const data = (await post("/api/craving", {
        action: "start",
        intensityBefore: intensity,
        situation,
        intervention: "intervention",
      })) as { craving: { id: string } };
      setCravingId(data.craving.id);
      setAfter((prev) => Math.min(prev, intensity));
      setPath("intervention");
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function finishTimer() {
    if (!cravingId) return;
    setBusy(true);
    try {
      const capped = Math.min(after, intensity);
      await post("/api/craving", {
        action: "complete",
        id: cravingId,
        intensityAfter: capped,
      });
      setAfter(capped);
      setStep(4);
    } finally {
      setBusy(false);
    }
  }

  async function finishIntervention() {
    if (!cravingId || selected.length === 0) return;
    setBusy(true);
    try {
      const capped = Math.min(after, intensity);
      await post("/api/craving", {
        action: "complete",
        id: cravingId,
        intensityAfter: capped,
        outcomes: selected,
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
          <h2>What do you want to try?</h2>
          <p className="muted">
            Wait ten minutes, or pick something to do now — not both.
          </p>
          <div className="choice-row">
            <button
              type="button"
              className="choice"
              disabled={busy}
              onClick={startTimer}
            >
              <strong>Start 10-minute timer</strong>
              <p className="tiny" style={{ margin: "6px 0 0" }}>
                Delay the decision. No intervention required.
              </p>
            </button>
            <button
              type="button"
              className="choice"
              disabled={busy}
              onClick={beginInterventionPath}
            >
              <strong>Choose intervention</strong>
              <p className="tiny" style={{ margin: "6px 0 0" }}>
                Pick what you&apos;ll try — you can select more than one.
              </p>
            </button>
          </div>
          <div style={{ marginTop: 8 }}>
            <SecondaryButton onClick={() => router.push("/")}>
              Not now
            </SecondaryButton>
          </div>
        </section>
      )}

      {step === 2 && path === "timer" && (
        <section className="panel success-pop">
          <p className="eyebrow">Waiting with you</p>
          <h1 style={{ fontVariantNumeric: "tabular-nums" }}>
            {mm}:{ss}
          </h1>
          <p className="muted">Breathe. The urge is information, not a command.</p>
          <PrimaryButton onClick={() => setStep(3)}>Timer done</PrimaryButton>
        </section>
      )}

      {step === 2 && path === "intervention" && (
        <section className="panel">
          <p className="eyebrow">Choose intervention</p>
          <p className="tiny" style={{ marginBottom: 10 }}>
            Select everything you&apos;re going to try.
          </p>
          <div className="choice-row">
            {interventions.map((i) => (
              <button
                key={i}
                type="button"
                className={
                  selected.includes(i) ? "choice selected" : "choice"
                }
                onClick={() => toggleIntervention(i)}
              >
                {i}
              </button>
            ))}
          </div>
          <PrimaryButton
            onClick={() => setStep(3)}
            disabled={selected.length === 0}
          >
            Continue
          </PrimaryButton>
        </section>
      )}

      {step === 3 && path === "timer" && (
        <section className="panel">
          <p className="eyebrow">After the wait</p>
          <ScaleInput
            label="Craving now"
            value={Math.min(after, intensity)}
            min={0}
            max={intensity}
            onChange={(n) => setAfter(Math.min(n, intensity))}
          />
          <PrimaryButton onClick={finishTimer} disabled={busy}>
            Record
          </PrimaryButton>
        </section>
      )}

      {step === 3 && path === "intervention" && (
        <section className="panel">
          <p className="eyebrow">How did it go?</p>
          <p className="tiny" style={{ marginBottom: 10 }}>
            {selected.join(" · ")}
          </p>
          <ScaleInput
            label="Craving now"
            value={Math.min(after, intensity)}
            min={0}
            max={intensity}
            onChange={(n) => setAfter(Math.min(n, intensity))}
          />
          <PrimaryButton
            onClick={finishIntervention}
            disabled={busy || selected.length === 0}
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
