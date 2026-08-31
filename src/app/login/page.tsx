"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

export default function LoginPage() {
  const { post, pinUnlockAvailable, deviceHint, refresh } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "pin">(
    pinUnlockAvailable ? "pin" : "password",
  );
  const [email, setEmail] = useState(deviceHint?.email ?? "");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (mode === "pin") {
        await post("/api/auth/pin-login", {
          pin,
          email: email || undefined,
          remember,
        });
      } else {
        await post("/api/auth/login", { email, password, remember });
      }
      await refresh();
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fade-in enroll-shell">
      <section className="stack enroll-step">
        <p className="brand-mark">JeremyOS</p>
        <h1>Welcome back.</h1>
        <p className="muted enroll-lead">
          {deviceHint
            ? `Continue as ${deviceHint.displayName} — quick PIN or full password.`
            : "Sign in to pick up where you left off."}
        </p>

        {pinUnlockAvailable && (
          <div className="chip-row">
            <button
              type="button"
              className={mode === "pin" ? "chip selected" : "chip"}
              onClick={() => setMode("pin")}
            >
              PIN
            </button>
            <button
              type="button"
              className={mode === "password" ? "chip selected" : "chip"}
              onClick={() => setMode("password")}
            >
              Email & password
            </button>
          </div>
        )}

        {mode === "password" ? (
          <>
            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            {!deviceHint && (
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
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
              />
            </label>
          </>
        )}

        <label className="check-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Remember me on this device</span>
        </label>

        {error && <p className="form-error">{error}</p>}
        <PrimaryButton onClick={() => void submit()} disabled={busy}>
          {busy ? "Signing in…" : "Continue"}
        </PrimaryButton>
        <p className="tiny muted" style={{ textAlign: "center" }}>
          <Link href="/forgot-password" className="text-link">
            Forgot password?
          </Link>
          {" · "}
          <Link href="/onboarding" className="text-link">
            Create account
          </Link>
        </p>
        {mode === "pin" && (
          <SecondaryButton onClick={() => setMode("password")}>
            Use password instead
          </SecondaryButton>
        )}
      </section>
    </main>
  );
}
