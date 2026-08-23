"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Money, PrimaryButton, SecondaryButton } from "@/components/ui";
import { fundTotal, mustTreat, pendingCashableMoments } from "@/lib/fund";
import { assignedRewardForMilestone } from "@/lib/journey";
import type { MilestoneAchievement, Reward } from "@/lib/types";

function SubtlePhotoPicker({
  preview,
  onPick,
  onClear,
}: {
  preview: string | null;
  onPick: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setLocalError("");
    try {
      const { fileToCompressedDataUrl } = await import("@/lib/clientPhoto");
      const dataUrl = await fileToCompressedDataUrl(file);
      onPick(dataUrl);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not use that photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-subtle">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {preview ? (
        <div className="photo-subtle-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Celebration preview" />
          <button type="button" className="dismiss-btn" onClick={onClear}>
            Remove
          </button>
        </div>
      ) : (
        <div className="photo-subtle-actions">
          <button
            type="button"
            className="photo-subtle-btn"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
          >
            {busy ? "Preparing photo…" : "Take a photo · optional"}
          </button>
          <button
            type="button"
            className="photo-subtle-btn"
            disabled={busy}
            onClick={() => libraryRef.current?.click()}
          >
            Choose from library
          </button>
        </div>
      )}
      {localError && <p className="error">{localError}</p>}
    </div>
  );
}

export function HomeRewardCard({
  moment,
  onDone,
}: {
  moment: MilestoneAchievement;
  onDone: () => void;
}) {
  const { state, post } = useApp();
  const forced = mustTreat(state);
  const assigned = assignedRewardForMilestone(state, moment.dayNumber);
  const treatBal = state.fund.treat ?? 0;
  const futureBal = state.fund.future ?? 0;

  const [step, setStep] = useState<"celebrate" | "claim" | "save">("celebrate");
  const [name, setName] = useState(assigned?.name ?? "");
  const [note, setNote] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const [spent, setSpent] = useState(
    assigned ? String(assigned.estimatedCost) : "",
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [pullFuture, setPullFuture] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const spentNum = Number(spent);
  const cost =
    assigned && Number.isFinite(spentNum) && spentNum > 0
      ? spentNum
      : (assigned?.estimatedCost ?? 0);
  const deficit = assigned
    ? Math.max(0, Math.round((cost - treatBal) * 100) / 100)
    : 0;
  const needsPull = Boolean(assigned && deficit > 0);
  const canAfford =
    !assigned || cost <= treatBal || (pullFuture && deficit <= futureBal);
  const spentValid =
    !assigned || (Number.isFinite(spentNum) && spentNum > 0);

  async function doSave() {
    if (!saveNote.trim()) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/milestone-reward", {
        action: "save",
        milestoneAchievementId: moment.id,
        note: saveNote.trim(),
        photoDataUrl: photoDataUrl || undefined,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function doClaim() {
    setBusy(true);
    setError("");
    try {
      if (assigned) {
        await post("/api/milestone-reward", {
          action: "treat",
          milestoneAchievementId: moment.id,
          rewardId: assigned.id,
          actualCost: spentNum,
          note: note.trim() || undefined,
          futurePull:
            needsPull && pullFuture ? deficit : needsPull ? 0 : undefined,
          photoDataUrl: photoDataUrl || undefined,
        });
      } else {
        await post("/api/milestone-reward", {
          action: "claim",
          milestoneAchievementId: moment.id,
          name: name.trim(),
          note: note.trim() || undefined,
          photoDataUrl: photoDataUrl || undefined,
        });
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (step === "celebrate") {
    return (
      <section className="panel home-reward-card fade-in">
        <p className="eyebrow">
          {moment.type === "destination" ? "Destination" : "Reward"} · Day{" "}
          {moment.dayNumber}
        </p>
        <h2>You&apos;ve earned this</h2>
        <p className="muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
          {moment.title} — choose your reward. A small celebration locks the
          win in.
        </p>
        {assigned && (
          <p className="tiny" style={{ marginTop: 10 }}>
            Assigned: {assigned.name} · <Money value={assigned.estimatedCost} />
          </p>
        )}
        <div className="home-reward-actions">
          <PrimaryButton onClick={() => setStep("claim")} disabled={busy}>
            Claim reward
          </PrimaryButton>
          {!forced && (
            <SecondaryButton
              onClick={() => {
                setError("");
                setStep("save");
              }}
              disabled={busy}
            >
              Save $ for future
            </SecondaryButton>
          )}
          {forced && (
            <p className="tiny">
              Two Saves in a row already — claim a reward this time.
            </p>
          )}
        </div>
        {error && (
          <p style={{ color: "var(--danger)", marginTop: 10 }}>{error}</p>
        )}
      </section>
    );
  }

  if (step === "save") {
    return (
      <section className="panel home-reward-card fade-in">
        <p className="eyebrow">Save $ for future · Day {moment.dayNumber}</p>
        <h2>{moment.title}</h2>
        <p className="muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
          Keep the short-term treat parked. Still celebrate today in a way that
          costs little or nothing.
        </p>
        <label className="field" style={{ marginTop: 12 }}>
          <span className="field-label">
            How are you rewarding yourself today?
          </span>
          <input
            value={saveNote}
            onChange={(e) => setSaveNote(e.target.value)}
            placeholder="A walk, good coffee, calling a friend…"
          />
        </label>
        <SubtlePhotoPicker
          preview={photoDataUrl}
          onPick={setPhotoDataUrl}
          onClear={() => setPhotoDataUrl(null)}
        />
        {error && (
          <p style={{ color: "var(--danger)", marginTop: 10 }}>{error}</p>
        )}
        <div className="home-reward-actions">
          <PrimaryButton
            onClick={doSave}
            disabled={busy || !saveNote.trim()}
          >
            {busy ? "Saving…" : "Confirm save"}
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              setStep("celebrate");
              setError("");
            }}
            disabled={busy}
          >
            Back
          </SecondaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="panel home-reward-card fade-in">
      <p className="eyebrow">Claim · Day {moment.dayNumber}</p>
      <h2>{moment.title}</h2>

      {assigned ? (
        <AssignedClaim
          reward={assigned}
          treatBal={treatBal}
          futureBal={futureBal}
          spent={spent}
          setSpent={setSpent}
          deficit={deficit}
          needsPull={needsPull}
          pullFuture={pullFuture}
          setPullFuture={setPullFuture}
          note={note}
          setNote={setNote}
          photoDataUrl={photoDataUrl}
          setPhotoDataUrl={setPhotoDataUrl}
        />
      ) : (
        <FreeClaim
          name={name}
          setName={setName}
          note={note}
          setNote={setNote}
          photoDataUrl={photoDataUrl}
          setPhotoDataUrl={setPhotoDataUrl}
        />
      )}

      {error && (
        <p style={{ color: "var(--danger)", marginTop: 10 }}>{error}</p>
      )}

      <div className="home-reward-actions">
        <PrimaryButton
          onClick={doClaim}
          disabled={
            busy ||
            (assigned ? !canAfford || !spentValid : !name.trim()) ||
            (needsPull && !pullFuture)
          }
        >
          {busy ? "Saving…" : "Confirm claim"}
        </PrimaryButton>
        <SecondaryButton
          onClick={() => {
            setStep("celebrate");
            setError("");
          }}
          disabled={busy}
        >
          Back
        </SecondaryButton>
      </div>
    </section>
  );
}

function AssignedClaim({
  reward,
  treatBal,
  futureBal,
  spent,
  setSpent,
  deficit,
  needsPull,
  pullFuture,
  setPullFuture,
  note,
  setNote,
  photoDataUrl,
  setPhotoDataUrl,
}: {
  reward: Reward;
  treatBal: number;
  futureBal: number;
  spent: string;
  setSpent: (v: string) => void;
  deficit: number;
  needsPull: boolean;
  pullFuture: boolean;
  setPullFuture: (v: boolean) => void;
  note: string;
  setNote: (v: string) => void;
  photoDataUrl: string | null;
  setPhotoDataUrl: (v: string | null) => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: 0, fontWeight: 650, fontSize: "1.1rem" }}>
        {reward.name}
      </p>
      <p className="tiny" style={{ marginTop: 4 }}>
        Planned <Money value={reward.estimatedCost} /> · Treat{" "}
        <Money value={treatBal} /> · Future <Money value={futureBal} />
      </p>
      <label className="field" style={{ marginTop: 12 }}>
        <span className="field-label">How much did you spend?</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={spent}
          onChange={(e) => setSpent(e.target.value)}
          placeholder={String(reward.estimatedCost)}
          autoFocus
        />
      </label>
      {needsPull && (
        <label
          className="field"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            marginTop: 10,
          }}
        >
          <input
            type="checkbox"
            checked={pullFuture}
            onChange={(e) => setPullFuture(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span className="tiny">
            Pull <Money value={deficit} /> from Future to cover the rest
          </span>
        </label>
      )}
      <label className="field" style={{ marginTop: 10 }}>
        <span className="field-label">Optional note</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything to remember?"
        />
      </label>
      <SubtlePhotoPicker
        preview={photoDataUrl}
        onPick={setPhotoDataUrl}
        onClear={() => setPhotoDataUrl(null)}
      />
    </div>
  );
}

function FreeClaim({
  name,
  setName,
  note,
  setNote,
  photoDataUrl,
  setPhotoDataUrl,
}: {
  name: string;
  setName: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  photoDataUrl: string | null;
  setPhotoDataUrl: (v: string | null) => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <label className="field">
        <span className="field-label">How did you treat yourself?</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Walk, dinner, massage…"
          autoFocus
        />
      </label>
      <label className="field">
        <span className="field-label">Optional note</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A little more context"
        />
      </label>
      <SubtlePhotoPicker
        preview={photoDataUrl}
        onPick={setPhotoDataUrl}
        onClear={() => setPhotoDataUrl(null)}
      />
    </div>
  );
}

export function FundSegmentBar({
  fund,
}: {
  fund: { future: number; treat: number; rebuild?: number };
}) {
  const future = (fund.future ?? 0) + (fund.rebuild ?? 0);
  const treat = fund.treat ?? 0;
  const total = fundTotal({ future, treat }) || 1;
  const segments = [
    { key: "future", name: "Future", value: future, color: "#5b8a7a" },
    { key: "treat", name: "Treat Yourself", value: treat, color: "#d4a24a" },
  ];
  return (
    <div>
      <div className="segment-bar" aria-hidden>
        {segments.map((s) => (
          <div
            key={s.key}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: s.color,
            }}
            title={`${s.name}: $${s.value}`}
          />
        ))}
      </div>
      <div className="segment-legend">
        {segments.map((s) => (
          <div key={s.key} className="segment-item">
            <span className="segment-dot" style={{ background: s.color }} />
            <span>
              {s.name} · <Money value={s.value} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function usePendingRewards() {
  const { state } = useApp();
  return pendingCashableMoments(state);
}
