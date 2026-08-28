"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, ScaleInput, SecondaryButton } from "@/components/ui";
import {
  formatDisplayDate,
  isValidEveningDate,
  missingEveningDates,
} from "@/lib/journey";

function EveningPageInner() {
  const { post, state, today, refresh } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("date") ?? "";

  const missing = useMemo(
    () => missingEveningDates(state, today || undefined),
    [state, today],
  );

  const preferredDate = useMemo(() => {
    if (
      requested &&
      isValidEveningDate(state, requested, today || undefined) &&
      missing.includes(requested)
    ) {
      return requested;
    }
    if (today && missing.includes(today)) return today;
    return missing[0] ?? "";
  }, [requested, state, today, missing]);

  const [closeDate, setCloseDate] = useState(preferredDate);
  const [mood, setMood] = useState(6);
  const [stress, setStress] = useState(5);
  const [oneLine, setOneLine] = useState("");
  const [standOut, setStandOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!closeDate || !missing.includes(closeDate)) {
      setCloseDate(preferredDate);
    }
  }, [preferredDate, missing, closeDate]);

  const effectiveDate =
    closeDate && missing.includes(closeDate) ? closeDate : preferredDate;

  const alreadyClosedToday =
    Boolean(today) && state.evenings.some((e) => e.date === today);
  const requestedAlreadyClosed =
    Boolean(requested) && state.evenings.some((e) => e.date === requested);

  async function submit() {
    if (!oneLine.trim() || !effectiveDate) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/evening", {
        date: effectiveDate,
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

  if (requestedAlreadyClosed && !result) {
    return (
      <main className="stack">
        <p className="eyebrow">Close the day</p>
        <h1>Already complete</h1>
        <p className="muted">
          {formatDisplayDate(requested)} already has a close.
        </p>
        {missing.length > 0 && (
          <SecondaryButton onClick={() => router.push("/journal")}>
            Pick a missed day
          </SecondaryButton>
        )}
        <PrimaryButton onClick={() => router.push("/")}>Home</PrimaryButton>
      </main>
    );
  }

  if (alreadyClosedToday && missing.length === 0 && !result) {
    return (
      <main className="stack">
        <p className="eyebrow">Close the day</p>
        <h1>Already complete</h1>
        <PrimaryButton onClick={() => router.push("/")}>Home</PrimaryButton>
      </main>
    );
  }

  if (result) {
    return (
      <main className="stack success-pop">
        <p className="eyebrow">Remember</p>
        <h1>Day closed.</h1>
        {effectiveDate && effectiveDate !== today && (
          <p className="muted">Backfilled {formatDisplayDate(effectiveDate)}</p>
        )}
        <div className="panel">
          <p style={{ margin: 0, fontSize: "1.15rem" }}>&ldquo;{oneLine}&rdquo;</p>
        </div>

        <PrimaryButton onClick={() => router.push("/")}>Home</PrimaryButton>

        <SecondaryButton onClick={() => router.push("/journal")}>
          Journal
        </SecondaryButton>
      </main>
    );
  }

  if (!effectiveDate) {
    return (
      <main className="stack">
        <p className="eyebrow">Close the day</p>
        <h1>Nothing to close</h1>
        <SecondaryButton onClick={() => router.push("/")}>Home</SecondaryButton>
      </main>
    );
  }

  const isBackfill = effectiveDate !== today;
  const showDayPicker =
    missing.length > 1 || (alreadyClosedToday && missing.length > 0);

  return (
    <main className="stack fade-in">
      <p className="eyebrow">{isBackfill ? "Catch up" : "Confirm + reflect"}</p>
      <h1>{isBackfill ? "Add a missed close" : "Close the day"}</h1>
      {isBackfill && (
        <p className="muted">
          Closing {formatDisplayDate(effectiveDate)} — same mood, stress, and
          one line as tonight.
        </p>
      )}

      {showDayPicker && (
        <section className="panel">
          <label className="field">
            <span className="field-label">Which day?</span>
            <select
              value={effectiveDate}
              onChange={(e) => setCloseDate(e.target.value)}
            >
              {missing.map((d) => (
                <option key={d} value={d}>
                  {formatDisplayDate(d)}
                  {d === today ? " (today)" : ""}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}

      <section className="panel">
        <p className="eyebrow">How did {isBackfill ? "that day" : "today"} go?</p>
        <ScaleInput label="Mood" value={mood} onChange={setMood} />
        <ScaleInput label="Stress" value={stress} onChange={setStress} />
      </section>

      <section className="panel">
        <p className="eyebrow">One line</p>
        <label className="field">
          <span className="field-label">
            What do you want to remember about{" "}
            {isBackfill ? formatDisplayDate(effectiveDate) : "today"}?
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
            Anything specific stand out{" "}
            {isBackfill ? "that day" : "today"}?
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
        {busy ? "Saving…" : isBackfill ? "Add journal entry" : "Close the day"}
      </PrimaryButton>
    </main>
  );
}

export default function EveningPage() {
  return (
    <Suspense
      fallback={
        <main className="stack">
          <p className="muted">Loading…</p>
        </main>
      }
    >
      <EveningPageInner />
    </Suspense>
  );
}
