"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  GENDER_OPTIONS,
  SUPPORT_INSPIRATION,
  US_STATES,
  type GenderOption,
} from "@/lib/auth-constants";
import type { RewardCategory, SupportConfig } from "@/lib/types";

const STEPS = [
  "Account",
  "About you",
  "Unlock",
  "Supports",
  "Money",
  "Rewards",
  "Trailhead",
] as const;

const CATEGORIES: RewardCategory[] = [
  "clothing",
  "wellness",
  "experiences",
  "growth",
  "travel",
  "food",
  "entertainment",
  "other",
];

type RewardDraft = {
  name: string;
  cost: string;
  category: RewardCategory;
  url: string;
};

function slugify(label: string) {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
  return base || "support";
}

function TrailProgress({ step }: { step: number }) {
  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  return (
    <div className="trail-progress" aria-label="Onboarding progress">
      <div className="trail-progress-meta">
        <span className="eyebrow">Trail marker {step + 1}</span>
        <span className="tiny muted">{STEPS[step]}</span>
      </div>
      <div className="trail-progress-track">
        <div className="trail-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="trail-progress-dots">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={
              i < step ? "dot done" : i === step ? "dot current" : "dot"
            }
            title={label}
          />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { post, authenticated, user, state } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // About
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<GenderOption | "">("");
  const [usState, setUsState] = useState("");

  // Unlock
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [skipPin, setSkipPin] = useState(false);

  // Supports
  const [supports, setSupports] = useState<SupportConfig[]>(() =>
    SUPPORT_INSPIRATION.slice(0, 4).map((s) => ({
      ...s,
      enabled: true,
    })),
  );
  const [customLabel, setCustomLabel] = useState("");
  const [customTarget, setCustomTarget] = useState("3");

  // Money
  const [spend, setSpend] = useState("40");
  const [treatPct, setTreatPct] = useState(70);

  // Rewards
  const [rewards, setRewards] = useState<RewardDraft[]>([
    { name: "", cost: "", category: "wellness", url: "" },
    { name: "", cost: "", category: "experiences", url: "" },
  ]);

  const futurePct = 100 - treatPct;

  useEffect(() => {
    if (user?.onboarded || state.profile?.onboarded) {
      router.replace("/");
    }
  }, [user?.onboarded, state.profile?.onboarded, router]);

  useEffect(() => {
    if (authenticated && user && step === 0) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setStep(1);
    }
  }, [authenticated, user, step]);

  const selectedTypes = useMemo(
    () => new Set(supports.map((s) => s.type)),
    [supports],
  );

  function toggleInspiration(type: string, label: string, weeklyTarget: number) {
    setSupports((prev) => {
      const exists = prev.find((s) => s.type === type);
      if (exists) return prev.filter((s) => s.type !== type);
      return [...prev, { type, label, weeklyTarget, enabled: true }];
    });
  }

  function updateSupportTarget(type: string, weeklyTarget: number) {
    setSupports((prev) =>
      prev.map((s) =>
        s.type === type
          ? { ...s, weeklyTarget: Math.max(0, Math.min(21, weeklyTarget)) }
          : s,
      ),
    );
  }

  function addCustomSupport() {
    const label = customLabel.trim();
    if (!label) return;
    let type = `custom_${slugify(label)}`;
    const existing = new Set(supports.map((s) => s.type));
    let n = 2;
    while (existing.has(type)) type = `custom_${slugify(label)}_${n++}`;
    setSupports((prev) => [
      ...prev,
      {
        type,
        label,
        weeklyTarget: Math.max(0, Math.min(21, Number(customTarget) || 0)),
        enabled: true,
      },
    ]);
    setCustomLabel("");
    setCustomTarget("3");
  }

  async function submitAccountAndAbout() {
    setBusy(true);
    setError("");
    try {
      if (!authenticated) {
        await post("/api/auth/signup", {
          email,
          password,
          confirmPassword: confirm,
          displayName,
          gender,
          usState,
          remember,
        });
      }
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not continue");
    } finally {
      setBusy(false);
    }
  }

  async function saveUnlock() {
    setBusy(true);
    setError("");
    try {
      if (!skipPin && pin) {
        if (pin !== pinConfirm) {
          throw new Error("PINs do not match");
        }
        if (pin.length !== 4) {
          throw new Error("PIN must be exactly 4 digits");
        }
        await post("/api/auth/pin", { pin });
      }
      await post("/api/auth/session", { remember });
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save unlock");
    } finally {
      setBusy(false);
    }
  }

  async function finishTrail() {
    setBusy(true);
    setError("");
    try {
      const seed = rewards
        .filter((r) => r.name.trim() && r.cost)
        .map((r) => ({
          name: r.name.trim(),
          estimatedCost: Number(r.cost),
          category: r.category,
          url: r.url.trim() || undefined,
        }));
      await post("/api/onboard", {
        displayName,
        historicalDailySpend: Number(spend),
        supports,
        treatPercent: treatPct,
        futurePercent: futurePct,
        rewards: seed,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start journey");
    } finally {
      setBusy(false);
    }
  }

  if (user?.onboarded || state.profile?.onboarded) return null;

  return (
    <main className="fade-in enroll-shell">
      {step < 6 && <TrailProgress step={Math.min(step, 5)} />}

      {step === 0 && (
        <section className="stack enroll-step" key="s0">
          <p className="brand-mark">REBUILD</p>
          <h1>Set out on the trail.</h1>
          <p className="muted enroll-lead">
            Create your account to begin. You&apos;re not promising forever —
            you&apos;re choosing a first step.
          </p>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          <label className="field">
            <span className="field-label">Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <PrimaryButton
            onClick={() => {
              setError("");
              if (!email.includes("@")) {
                setError("Enter a valid email");
                return;
              }
              if (password.length < 8) {
                setError("Password must be at least 8 characters");
                return;
              }
              if (password !== confirm) {
                setError("Passwords do not match");
                return;
              }
              setStep(1);
            }}
          >
            Continue along the trail
          </PrimaryButton>
          <p className="tiny muted" style={{ textAlign: "center" }}>
            Already enrolled?{" "}
            <Link href="/login" className="text-link">
              Log in
            </Link>
          </p>
        </section>
      )}

      {step === 1 && (
        <section className="stack enroll-step" key="s1">
          <p className="eyebrow">Mile marker</p>
          <h1>Who&apos;s walking this path?</h1>
          <p className="muted enroll-lead">
            A name for encouragement — and a few details so we can keep your
            trail private and yours.
          </p>
          <label className="field">
            <span className="field-label">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
            />
          </label>
          <label className="field">
            <span className="field-label">Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderOption)}
            >
              <option value="">Select…</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">State</span>
            <select
              value={usState}
              onChange={(e) => setUsState(e.target.value)}
            >
              <option value="">Select…</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <PrimaryButton
            onClick={() => {
              if (!displayName.trim()) {
                setError("Display name required");
                return;
              }
              if (!gender) {
                setError("Gender required");
                return;
              }
              if (!usState) {
                setError("State required");
                return;
              }
              void submitAccountAndAbout();
            }}
            disabled={busy}
          >
            {busy ? "Creating account…" : "Claim your trailhead"}
          </PrimaryButton>
          <SecondaryButton onClick={() => setStep(0)} disabled={busy}>
            Back
          </SecondaryButton>
        </section>
      )}

      {step === 2 && (
        <section className="stack enroll-step" key="s2">
          <p className="eyebrow">Camp lock</p>
          <h1>Keep it private.</h1>
          <p className="muted enroll-lead">
            Optional 4-digit PIN for quick access on any device — or stay signed
            in on this one like you do today.
          </p>
          <label className="check-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me on this device</span>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={skipPin}
              onChange={(e) => setSkipPin(e.target.checked)}
            />
            <span>Skip PIN for now</span>
          </label>
          {!skipPin && (
            <>
              <label className="field">
                <span className="field-label">4-digit PIN</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="••••"
                />
              </label>
              <label className="field">
                <span className="field-label">Confirm PIN</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinConfirm}
                  onChange={(e) =>
                    setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
              </label>
            </>
          )}
          {error && <p className="form-error">{error}</p>}
          <PrimaryButton onClick={() => void saveUnlock()} disabled={busy}>
            {busy ? "Saving…" : "Continue"}
          </PrimaryButton>
          <SecondaryButton onClick={() => setStep(1)} disabled={busy}>
            Back
          </SecondaryButton>
        </section>
      )}

      {step === 3 && (
        <section className="stack enroll-step" key="s3">
          <p className="eyebrow">Provisions</p>
          <h1>What will support you each week?</h1>
          <p className="muted enroll-lead">
            Pick inspiration chips or add your own. Set a weekly rhythm —
            targets, not shame.
          </p>
          <div className="chip-row">
            {SUPPORT_INSPIRATION.map((s) => {
              const on = selectedTypes.has(s.type);
              return (
                <button
                  key={s.type}
                  type="button"
                  className={on ? "chip selected" : "chip"}
                  onClick={() =>
                    toggleInspiration(s.type, s.label, s.weeklyTarget)
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {supports.map((s) => (
              <div key={s.type} className="panel support-row">
                <div>
                  <strong>{s.label}</strong>
                  <p className="tiny muted" style={{ margin: "4px 0 0" }}>
                    times / week
                  </p>
                </div>
                <input
                  className="target-input"
                  type="number"
                  min={0}
                  max={21}
                  value={s.weeklyTarget}
                  onChange={(e) =>
                    updateSupportTarget(s.type, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
          <div className="panel">
            <p className="tiny" style={{ marginTop: 0 }}>
              Add your own
            </p>
            <div className="grid-2">
              <label className="field">
                <span className="field-label">Support</span>
                <input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Journal"
                />
              </label>
              <label className="field">
                <span className="field-label">Weekly</span>
                <input
                  type="number"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                />
              </label>
            </div>
            <SecondaryButton onClick={addCustomSupport}>Add</SecondaryButton>
          </div>
          {error && <p className="form-error">{error}</p>}
          <PrimaryButton
            onClick={() => {
              if (supports.length === 0) {
                setError("Choose at least one support");
                return;
              }
              setError("");
              setStep(4);
            }}
          >
            Pack these for the week
          </PrimaryButton>
          <SecondaryButton onClick={() => setStep(2)}>Back</SecondaryButton>
        </section>
      )}

      {step === 4 && (
        <section className="stack enroll-step" key="s4">
          <p className="eyebrow">Rebuild fund</p>
          <h1>What did this typically cost you?</h1>
          <p className="muted enroll-lead">
            Combined daily historical spend. Each aligned day can reclaim this
            into your fund.
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
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Recommended split
            </p>
            <p style={{ margin: "0 0 12px" }}>
              <strong>{treatPct}% Treat Yourself</strong> · {futurePct}% Future
            </p>
            <p className="tiny muted">
              Treat is for near-term rewards. Future is longer-horizon park. You
              can nudge the slider — we recommend 70 / 30.
            </p>
            <label className="field" style={{ marginTop: 12 }}>
              <span className="field-label">Treat Yourself %</span>
              <input
                type="range"
                min={50}
                max={90}
                step={5}
                value={treatPct}
                onChange={(e) => setTreatPct(Number(e.target.value))}
              />
            </label>
            <p className="tiny">
              Note: the live fund ledger uses the locked 70/30 model; this
              confirms you understand the split.
            </p>
          </div>
          {error && <p className="form-error">{error}</p>}
          <PrimaryButton
            onClick={() => {
              if (!Number.isFinite(Number(spend)) || Number(spend) < 0) {
                setError("Enter a daily spend amount");
                return;
              }
              setError("");
              setStep(5);
            }}
          >
            Continue
          </PrimaryButton>
          <SecondaryButton onClick={() => setStep(3)}>Back</SecondaryButton>
        </section>
      )}

      {step === 5 && (
        <section className="stack enroll-step" key="s5">
          <p className="eyebrow">Something to walk toward</p>
          <h1>Add a couple rewards to start.</h1>
          <p className="muted enroll-lead">
            Wishlist items you&apos;ll earn with Treat Yourself — same as in
            Rewards. Skip if you want; you can add more later.
          </p>
          {rewards.map((r, idx) => (
            <div key={idx} className="panel stack" style={{ gap: 10 }}>
              <p className="tiny" style={{ margin: 0 }}>
                Reward {idx + 1}
              </p>
              <label className="field">
                <span className="field-label">Name</span>
                <input
                  value={r.name}
                  onChange={(e) =>
                    setRewards((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="New pants, massage…"
                />
              </label>
              <div className="grid-2">
                <label className="field">
                  <span className="field-label">Cost</span>
                  <input
                    type="number"
                    value={r.cost}
                    onChange={(e) =>
                      setRewards((prev) =>
                        prev.map((x, i) =>
                          i === idx ? { ...x, cost: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">Category</span>
                  <select
                    value={r.category}
                    onChange={(e) =>
                      setRewards((prev) =>
                        prev.map((x, i) =>
                          i === idx
                            ? {
                                ...x,
                                category: e.target.value as RewardCategory,
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span className="field-label">Buy link (optional)</span>
                <input
                  type="url"
                  value={r.url}
                  onChange={(e) =>
                    setRewards((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, url: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="https://…"
                />
              </label>
            </div>
          ))}
          {error && <p className="form-error">{error}</p>}
          <PrimaryButton onClick={() => void finishTrail()} disabled={busy}>
            {busy ? "Opening the trail…" : "Finish & step onto the trail"}
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              setRewards([
                { name: "", cost: "", category: "wellness", url: "" },
                { name: "", cost: "", category: "experiences", url: "" },
              ]);
              void finishTrail();
            }}
            disabled={busy}
          >
            Skip rewards for now
          </SecondaryButton>
          <SecondaryButton onClick={() => setStep(4)} disabled={busy}>
            Back
          </SecondaryButton>
        </section>
      )}

      {step === 6 && (
        <section className="stack enroll-step success-pop" key="s6">
          <p className="eyebrow">Trailhead</p>
          <h1>You&apos;re on the path, {displayName.split(" ")[0] || "friend"}.</h1>
          <p className="muted enroll-lead">
            Day 1 is yours. One camp at a time — we&apos;ll walk with you.
          </p>
          <div className="panel">
            <p className="tiny">Money potentially reclaimed today</p>
            <p className="money money-xl">${Number(spend) || 0}</p>
            <p className="tiny" style={{ marginTop: 12 }}>
              Fund split · 70% Treat · 30% Future
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
