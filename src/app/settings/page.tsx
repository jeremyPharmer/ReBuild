"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { DEFAULT_SUPPORTS, type SupportConfig } from "@/lib/types";

export default function SettingsPage() {
  const { state, post, refresh } = useApp();
  const router = useRouter();
  const [supports, setSupports] = useState<SupportConfig[]>(
    state.profile?.supports ?? DEFAULT_SUPPORTS,
  );
  const [spend, setSpend] = useState(
    String(state.profile?.historicalDailySpend ?? 40),
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function updateTarget(type: string, weeklyTarget: number) {
    setSupports((prev) =>
      prev.map((s) => (s.type === type ? { ...s, weeklyTarget } : s)),
    );
  }

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      await post("/api/settings", {
        supports,
        historicalDailySpend: Number(spend),
      });
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetAll() {
    if (!window.confirm("Reset all Rebuild data for this device/server?")) {
      return;
    }
    await fetch("/api/reset", { method: "POST" });
    await refresh();
    router.push("/onboarding");
  }

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Configure</p>
        <h1>Settings</h1>
        <p className="muted">No auth in V1 — open link and go.</p>
      </header>

      <section className="panel">
        <p className="eyebrow">Historical daily spend</p>
        <label className="field">
          <span className="field-label">Combined $/day</span>
          <input
            type="number"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
          />
        </label>
      </section>

      <section className="panel">
        <p className="eyebrow">Weekly supports</p>
        {supports.map((s) => (
          <label key={s.type} className="field">
            <span className="field-label">{s.label} / week</span>
            <input
              type="number"
              min={0}
              max={14}
              value={s.weeklyTarget}
              onChange={(e) => updateTarget(s.type, Number(e.target.value))}
            />
          </label>
        ))}
      </section>

      {msg && <p className="chip good">{msg}</p>}
      <PrimaryButton onClick={save} disabled={busy}>
        Save
      </PrimaryButton>
      <SecondaryButton onClick={() => router.push("/")}>Home</SecondaryButton>
      <SecondaryButton onClick={resetAll}>Reset all data</SecondaryButton>
    </main>
  );
}
