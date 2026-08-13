"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PrimaryButton } from "@/components/ui";

function ResetForm() {
  const { post, refresh } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await post("/api/auth/reset-password", {
        email,
        token,
        password,
        confirmPassword: confirm,
      });
      await refresh();
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack enroll-step">
      <p className="brand-mark">REBUILD</p>
      <h1>Choose a new password.</h1>
      <label className="field">
        <span className="field-label">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="field">
        <span className="field-label">New password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className="field">
        <span className="field-label">Confirm</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>
      {!token && (
        <label className="field">
          <span className="field-label">Reset token</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
      )}
      {error && <p className="form-error">{error}</p>}
      <PrimaryButton onClick={() => void submit()} disabled={busy}>
        {busy ? "Saving…" : "Update password"}
      </PrimaryButton>
      <p className="tiny muted" style={{ textAlign: "center" }}>
        <Link href="/login" className="text-link">
          Back to login
        </Link>
      </p>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="fade-in enroll-shell">
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
