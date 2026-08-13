"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";
import { Money } from "@/components/ui";
import { waitingReclaimTotal } from "@/lib/journey";
import { quoteById } from "@/lib/quotes";

export default function MorningPage() {
  const { post, state, dashboard, today, refresh } = useApp();
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
  const [provisionDraft, setProvisionDraft] = useState("");
  const [provisionBusy, setProvisionBusy] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);

  const todayMorning = state.mornings.find((m) => m.date === today);
  const quote = useMemo(
    () => quoteById(todayMorning?.quoteId),
    [todayMorning?.quoteId],
  );
  const todayProvisions = (state.dayProvisions ?? []).filter(
    (p) => p.date === today,
  );

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

  async function addProvision() {
    const label = provisionDraft.trim();
    if (!label) return;
    setProvisionBusy(true);
    try {
      await post("/api/day-provision", {
        action: "add",
        date: today,
        label,
      });
      setProvisionDraft("");
      setProvisionOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add provision");
    } finally {
      setProvisionBusy(false);
    }
  }

  if (todayMorning && !done) {
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
        {quote && (
          <section className="panel morning-quote">
            <p className="morning-quote-text">&ldquo;{quote.text}&rdquo;</p>
            <p className="tiny morning-quote-attr">— {quote.attribution}</p>
          </section>
        )}
        <p className="eyebrow">Today&apos;s Rebuild</p>
        <h1>Set yourself up.</h1>
        <div className="panel list-check">
          <p className="eyebrow" style={{ marginBottom: 10 }}>
            Provisions
          </p>
          {state.profile?.supports
            .filter((s) => s.enabled)
            .map((s) => (
              <div key={s.type} className="check-item">
                <span className="check-box" />
                <div>
                  <strong>{s.label}</strong>
                </div>
              </div>
            ))}
          {todayProvisions.map((p) => (
            <div key={p.id} className="check-item">
              <span className="check-box" />
              <div>
                <strong>{p.label}</strong>
              </div>
            </div>
          ))}
          <div className="check-item" style={{ marginTop: 4 }}>
            <span className="check-box" />
            <div>
              <strong>Money</strong>
              <p className="tiny">
                <Money value={waiting} /> ready to reclaim this evening
              </p>
            </div>
          </div>
          {!provisionOpen ? (
            <button
              type="button"
              className="morning-add-provision-toggle"
              onClick={() => setProvisionOpen(true)}
            >
              <span>Add a one time provision for today</span>
              <span className="morning-add-plus" aria-hidden>
                +
              </span>
            </button>
          ) : (
            <div className="morning-add-provision fade-in">
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Provision for today</span>
                <input
                  type="text"
                  value={provisionDraft}
                  onChange={(e) => setProvisionDraft(e.target.value)}
                  placeholder="One short line"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void addProvision();
                    }
                  }}
                />
              </label>
              <div className="morning-add-provision-actions">
                <SecondaryButton
                  onClick={() => {
                    setProvisionOpen(false);
                    setProvisionDraft("");
                  }}
                  disabled={provisionBusy}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  onClick={() => void addProvision()}
                  disabled={provisionBusy || !provisionDraft.trim()}
                >
                  {provisionBusy ? "Adding…" : "Add"}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
        {intention && (
          <div className="panel">
            <p className="eyebrow">Today&apos;s intention</p>
            <p style={{ margin: 0, fontSize: "1.15rem" }}>{intention}</p>
          </div>
        )}
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
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
          <span className="field-label">
            Any trigger or concern for today
          </span>
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
