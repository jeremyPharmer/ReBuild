"use client";

import Link from "next/link";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function submit() {
    setBusy(true);
    setMessage("");
    setResetUrl("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || "Check your email for a reset link.");
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fade-in enroll-shell">
      <section className="stack enroll-step">
        <p className="brand-mark">JeremyOS</p>
        <h1>Reset your password.</h1>
        <p className="muted enroll-lead">
          We&apos;ll send a link to your email. Email delivery ships fully with
          the email integration — on dev you may get a direct link below.
        </p>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {message && <p className="muted">{message}</p>}
        {resetUrl && (
          <div className="panel">
            <p className="tiny">Dev reset link</p>
            <a className="text-link" href={resetUrl}>
              {resetUrl}
            </a>
          </div>
        )}
        <PrimaryButton onClick={() => void submit()} disabled={busy || !email}>
          {busy ? "Sending…" : "Send reset link"}
        </PrimaryButton>
        <p className="tiny muted" style={{ textAlign: "center" }}>
          <Link href="/login" className="text-link">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
