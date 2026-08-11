"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton } from "@/components/ui";
import { DEFAULT_SUPPORTS } from "@/lib/types";

export default function OnboardingPage() {
  const { post, state } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile?.displayName || "Founder");
  const [spend, setSpend] = useState(
    state.profile?.historicalDailySpend?.toString() || "40",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state.profile?.onboarded && step === 0) router.replace("/");
  }, [state.profile?.onboarded, step, router]);

  if (state.profile?.onboarded && step === 0) {
    return null;
  }

  async function finish() {
    setBusy(true);
    setError("");
    try {
      await post("/api/onboard", {
        displayName: name,
        historicalDailySpend: Number(spend),
        supports: DEFAULT_SUPPORTS,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fade-in">
      {step === 0 && (
        <section className="stack">
          <p className="eyebrow">Day 1</p>
          <h1>You are here.</h1>
          <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.5 }}>
            You&apos;re not promising forever today.
            <br />
            You&apos;re starting the journey.
          </p>
          <p style={{ marginTop: 24, lineHeight: 1.5 }}>
            Recovery shouldn&apos;t just take something away from you. It should
            give your life back to you.
          </p>
          <PrimaryButton onClick={() => setStep(1)}>Continue</PrimaryButton>
        </section>
      )}

      {step === 1 && (
        <section className="stack">
          <p className="eyebrow">Goal</p>
          <h1>What are you rebuilding?</h1>
          <div className="panel">
            <p style={{ margin: 0, fontWeight: 600 }}>
              Cannabis + alcohol abstinence
            </p>
            <p className="tiny" style={{ marginTop: 8 }}>
              One journey. Clean on both to stay aligned. A return on either is a
              full return day — no reclaim that day.
            </p>
          </div>
          <label className="field">
            <span className="field-label">What should we call you?</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <PrimaryButton onClick={() => setStep(2)}>Continue</PrimaryButton>
        </section>
      )}

      {step === 2 && (
        <section className="stack">
          <p className="eyebrow">Rebuild fund</p>
          <h1>What did this typically cost you?</h1>
          <p className="muted">
            Combined daily historical spend. V1 only reclaims on full abstinence
            days.
          </p>
          <label className="field">
            <span className="field-label">Estimated $/day</span>
            <input
              type="number"
              min={0}
              step={1}
              value={spend}
              onChange={(e) => setSpend(e.target.value)}
            />
          </label>
          <div className="panel">
            <p className="tiny">Default weekly supports (editable later)</p>
            <p style={{ margin: "8px 0 0" }}>
              Recovery content 2 · Meditation 5 · Medication 7 · Gym 4
            </p>
          </div>
          {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
          <PrimaryButton onClick={finish} disabled={busy}>
            {busy ? "Starting…" : "Start your day"}
          </PrimaryButton>
        </section>
      )}

      {step === 3 && (
        <section className="stack success-pop">
          <p className="eyebrow">Begin</p>
          <h1>Day 1 is yours.</h1>
          <div className="panel">
            <p className="tiny">Money potentially reclaimed today</p>
            <p className="money money-xl">${Number(spend) || 0}</p>
            <p className="tiny" style={{ marginTop: 12 }}>
              Next milestone · Day 2 · Keep Going
            </p>
            <p className="tiny">First meaningful reward · Day 3 · First Win</p>
          </div>
          <PrimaryButton onClick={() => router.push("/morning")}>
            Start the day
          </PrimaryButton>
        </section>
      )}
    </main>
  );
}
