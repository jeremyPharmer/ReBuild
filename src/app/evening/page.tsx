"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { MilestoneRewardMoment } from "@/components/MilestoneReward";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";
import { pendingCashableMoments } from "@/lib/fund";
import type { AlignmentStatus, MilestoneAchievement } from "@/lib/types";

export default function EveningPage() {
  const { post, state, today, refresh } = useApp();
  const router = useRouter();
  const [mood, setMood] = useState(6);
  const [craving, setCraving] = useState(3);
  const [alignment, setAlignment] = useState<AlignmentStatus | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [oneLine, setOneLine] = useState("");
  const [expanded, setExpanded] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    "aligned" | "return_to_use" | "other" | null
  >(null);
  const [pending, setPending] = useState<MilestoneAchievement[]>([]);
  const [error, setError] = useState("");

  const openPending = pendingCashableMoments(state).filter((m) =>
    pending.some((p) => p.id === m.id),
  );

  async function submit() {
    if (!alignment || !oneLine.trim()) return;
    setBusy(true);
    setError("");
    try {
      const data = (await post("/api/evening", {
        date: today,
        mood,
        craving,
        alignment,
        returnNotes: alignment === "return_to_use" ? returnNotes : undefined,
        oneLine,
        expandedJournal: expanded || undefined,
      })) as { pendingRewards?: MilestoneAchievement[] };
      setPending(data.pendingRewards ?? []);
      setResult(alignment);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (state.evenings.some((e) => e.date === today) && !result) {
    const lingering = pendingCashableMoments(state);
    if (lingering.length > 0) {
      return (
        <main className="stack fade-in">
          <p className="eyebrow">Reward moment</p>
          <h1>Finish your decision</h1>
          {lingering.map((m) => (
            <MilestoneRewardMoment
              key={m.id}
              moment={m}
              onDone={() => refresh()}
            />
          ))}
          <SecondaryButton onClick={() => router.push("/")}>Home</SecondaryButton>
        </main>
      );
    }
    return (
      <main className="stack">
        <p className="eyebrow">Close the day</p>
        <h1>Already complete</h1>
        <SecondaryButton onClick={() => router.push("/")}>Home</SecondaryButton>
      </main>
    );
  }

  if (result === "return_to_use") {
    return (
      <main className="stack success-pop">
        <p className="eyebrow">Your journey continues</p>
        <h1>You encountered a storm.</h1>
        <p className="muted" style={{ lineHeight: 1.5 }}>
          You did not lose the journey. Earned money, history, milestones, and
          journal entries stay. The current run starts again tomorrow.
        </p>
        <PrimaryButton onClick={() => router.push("/")}>
          Keep going
        </PrimaryButton>
      </main>
    );
  }

  if (result) {
    const stillOpen = openPending.length
      ? openPending
      : pendingCashableMoments(state);
    return (
      <main className="stack success-pop">
        <p className="eyebrow">Remember</p>
        <h1>Day closed.</h1>
        <div className="panel">
          <p style={{ margin: 0, fontSize: "1.15rem" }}>&ldquo;{oneLine}&rdquo;</p>
        </div>

        {stillOpen.map((m) => (
          <MilestoneRewardMoment
            key={m.id}
            moment={m}
            onDone={() => refresh()}
          />
        ))}

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
        <ScaleInput label="Craving" value={craving} onChange={setCraving} />
      </section>

      <section className="panel">
        <p className="eyebrow">Did you stay aligned with your Rebuild goal?</p>
        <div className="choice-row">
          {(
            [
              ["aligned", "✓ Yes"],
              ["return_to_use", "⚠ Return to use"],
              ["other", "→ Something else happened"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={alignment === value ? "choice selected" : "choice"}
              onClick={() => setAlignment(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {alignment === "return_to_use" && (
          <label className="field" style={{ marginTop: 12 }}>
            <span className="field-label">What happened?</span>
            <textarea
              rows={3}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Context, what preceded it…"
            />
          </label>
        )}
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
        <label className="field">
          <span className="field-label">Optional longer note</span>
          <textarea
            rows={3}
            value={expanded}
            onChange={(e) => setExpanded(e.target.value)}
          />
        </label>
      </section>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <PrimaryButton
        onClick={submit}
        disabled={busy || !alignment || !oneLine.trim()}
      >
        {busy ? "Saving…" : "Close the day"}
      </PrimaryButton>
    </main>
  );
}
