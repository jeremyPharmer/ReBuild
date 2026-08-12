"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";

export default function EveningPage() {
  const { post, state, today, refresh } = useApp();
  const router = useRouter();
  const [mood, setMood] = useState(6);
  const [stress, setStress] = useState(5);
  const [oneLine, setOneLine] = useState("");
  const [standOut, setStandOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!oneLine.trim()) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/evening", {
        date: today,
        mood,
        stress,
        oneLine,
        expandedJournal: standOut.trim() || undefined,
      });
      setResult(true);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (state.evenings.some((e) => e.date === today) && !result) {
    return (
      <main className="stack">
        <p className="eyebrow">Close the day</p>
        <h1>Already complete</h1>
        <PrimaryButton onClick={() => router.push("/money")}>
          Move money to Rebuild
        </PrimaryButton>
        <SecondaryButton onClick={() => router.push("/")}>Home</SecondaryButton>
      </main>
    );
  }

  if (result) {
    return (
      <main className="stack success-pop">
        <p className="eyebrow">Remember</p>
        <h1>Day closed.</h1>
        <div className="panel">
          <p style={{ margin: 0, fontSize: "1.15rem" }}>&ldquo;{oneLine}&rdquo;</p>
        </div>

        <PrimaryButton onClick={() => router.push("/money")}>
          Move money to Rebuild
        </PrimaryButton>

        <SecondaryButton onClick={() => router.push("/")}>Home</SecondaryButton>
      </main>
    );
  }

  return (
    <main className="stack fade-in">
      <p className="eyebrow">Confirm + reflect</p>
      <h1>Close the day</h1>

      <section className="panel">
        <p className="eyebrow">How did today go?</p>
        <ScaleInput label="Mood" value={mood} onChange={setMood} />
        <ScaleInput label="Stress" value={stress} onChange={setStress} />
      </section>

      <section className="panel">
        <p className="eyebrow">One line</p>
        <label className="field">
          <span className="field-label">
            What do you want to remember about today?
          </span>
          <input
            type="text"
            value={oneLine}
            onChange={(e) => setOneLine(e.target.value)}
            placeholder="One sentence is enough"
          />
        </label>
      </section>

      <section className="panel">
        <label className="field">
          <span className="field-label">
            Anything specific stand out today?
          </span>
          <textarea
            rows={2}
            value={standOut}
            onChange={(e) => setStandOut(e.target.value)}
            placeholder="Optional — a little more context"
          />
        </label>
      </section>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <PrimaryButton
        onClick={submit}
        disabled={busy || !oneLine.trim()}
      >
        {busy ? "Saving…" : "Close the day"}
      </PrimaryButton>
    </main>
  );
}
