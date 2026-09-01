"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { ThemePicker } from "@/components/ThemePicker";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { SUPPORT_LABEL_MAX } from "@/lib/auth-constants";
import { DEFAULT_SUPPORTS, type SupportConfig } from "@/lib/types";

function slugify(label: string) {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 24);
  return base || "support";
}

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastActiveDay: string | null;
  onboarded: boolean;
};

export default function SettingsPage() {
  const { state, today, post, refresh, env, user } = useApp();
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[] | null>(null);
  const [adminError, setAdminError] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [supports, setSupports] = useState<SupportConfig[]>(
    state.profile?.supports ?? DEFAULT_SUPPORTS,
  );
  const [spend, setSpend] = useState(
    String(state.profile?.historicalDailySpend ?? 40),
  );
  const [email, setEmail] = useState(state.profile?.email ?? "");
  const [personalIcalUrl, setPersonalIcalUrl] = useState(
    state.profile?.personalIcalUrl ?? "",
  );
  const [workIcalUrl, setWorkIcalUrl] = useState(
    state.profile?.workIcalUrl ?? "",
  );
  const reminders = state.profile?.reminders;
  const [morningOn, setMorningOn] = useState(
    reminders?.morningEnabled ?? Boolean(reminders?.enabled),
  );
  const [eveningOn, setEveningOn] = useState(
    reminders?.eveningEnabled ?? Boolean(reminders?.enabled),
  );
  const [morningHour, setMorningHour] = useState(
    String(state.profile?.reminders?.morningHour ?? 7),
  );
  const [eveningHour, setEveningHour] = useState(
    String(state.profile?.reminders?.eveningHour ?? 20),
  );
  const [newLabel, setNewLabel] = useState("");
  const [newTarget, setNewTarget] = useState("3");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [testMsg, setTestMsg] = useState("");

  function updateSupport(type: string, patch: Partial<SupportConfig>) {
    setSupports((prev) =>
      prev.map((s) => (s.type === type ? { ...s, ...patch } : s)),
    );
  }

  function addSupport() {
    const label = newLabel.trim().slice(0, SUPPORT_LABEL_MAX);
    if (!label) return;
    let type = `custom_${slugify(label)}`;
    const existing = new Set(supports.map((s) => s.type));
    let n = 2;
    while (existing.has(type)) {
      type = `custom_${slugify(label)}_${n++}`;
    }
    setSupports((prev) => [
      ...prev,
      {
        type,
        label,
        weeklyTarget: Math.max(0, Math.min(14, Number(newTarget) || 0)),
        enabled: true,
      },
    ]);
    setNewLabel("");
    setNewTarget("3");
  }

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      await post("/api/settings", {
        supports,
        historicalDailySpend: Number(spend),
        email,
        personalIcalUrl,
        workIcalUrl,
        reminders: {
          morningEnabled: morningOn,
          eveningEnabled: eveningOn,
          morningHour: Number(morningHour),
          eveningHour: Number(eveningHour),
        },
      });
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest(kind: "morning" | "evening") {
    setBusy(true);
    setTestMsg("");
    try {
      await post("/api/reminders/test", { kind, email });
      setTestMsg(
        kind === "morning"
          ? "Test Start-the-day email sent."
          : "Test Close-the-day email sent.",
      );
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetAll() {
    if (env === "prod") return;
    if (!window.confirm("Reset all JeremyOS data on DEV?")) {
      return;
    }
    const res = await fetch("/api/reset", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      window.alert(data.error || "Reset failed");
      return;
    }
    await refresh();
    router.push("/onboarding");
  }

  async function loadAdmin() {
    setAdminError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAdminUsers(data.users || []);
      setAdminOpen(true);
    } catch (e) {
      setAdminError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await post("/api/auth/logout", {});
      router.replace("/login");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Logout failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetJourney() {
    if (
      !window.confirm(
        "Are you sure you want to do this?",
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await post("/api/journey/reset", { date: today });
      setMsg("Journey reset. Your next climb starts tomorrow.");
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not reset journey");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="stack fade-in">
      <header>
        <p className="eyebrow">Configure</p>
        <h1>Settings</h1>
        <p className="muted">
          Environment: <strong>{env}</strong>
          {env === "prod"
            ? " · history retained across updates"
            : " · safe to reset for testing"}
          . Spend and supports — edit anytime.
        </p>
      </header>

      <ThemePicker />

      <section className="panel">
        <p className="eyebrow">Account</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Signed in as <strong>{user?.email || state.profile?.email}</strong>
        </p>
        <SecondaryButton onClick={() => void logout()} disabled={busy}>
          Log out
        </SecondaryButton>
      </section>

      {user?.isAdmin && (
        <section className="panel">
          <p className="eyebrow">Admin</p>
          <p className="muted" style={{ marginTop: 0 }}>
            See who has created an account and their last active day (start or
            close).
          </p>
          {!adminOpen ? (
            <PrimaryButton onClick={() => void loadAdmin()} disabled={busy}>
              Open admin
            </PrimaryButton>
          ) : (
            <div className="admin-user-list">
              {(adminUsers || []).map((u) => (
                <div key={u.id} className="admin-user-row">
                  <div>
                    <strong>{u.displayName || u.email}</strong>
                    <p className="tiny muted" style={{ margin: "4px 0 0" }}>
                      {u.email}
                    </p>
                  </div>
                  <div className="tiny" style={{ textAlign: "right" }}>
                    <div>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                    {u.lastActiveDay && (
                      <div>
                        Last active day{" "}
                        {new Date(
                          `${u.lastActiveDay}T12:00:00`,
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {adminUsers?.length === 0 && (
                <p className="muted">No users yet.</p>
              )}
            </div>
          )}
          {adminError && <p className="form-error">{adminError}</p>}
        </section>
      )}

      <section className="panel">
        <p className="eyebrow">Email nudges</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Start-of-day and end-of-day emails, separately, in{" "}
          {state.profile?.timezone || "America/New_York"}.
        </p>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <label className="check-item check-item-row" style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            checked={morningOn}
            onChange={(e) => setMorningOn(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <span className="check-label">Start-of-day email</span>
        </label>
        <label className="check-item check-item-row" style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            checked={eveningOn}
            onChange={(e) => setEveningOn(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <span className="check-label">End-of-day email</span>
        </label>
        <div className="grid-2" style={{ marginTop: 10 }}>
          <label className="field">
            <span className="field-label">Start hour (0–23)</span>
            <input
              type="number"
              min={0}
              max={23}
              value={morningHour}
              onChange={(e) => setMorningHour(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Close hour (0–23)</span>
            <input
              type="number"
              min={0}
              max={23}
              value={eveningHour}
              onChange={(e) => setEveningHour(e.target.value)}
            />
          </label>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <SecondaryButton
            onClick={() => sendTest("morning")}
            disabled={busy || !email.trim()}
          >
            Test morning
          </SecondaryButton>
          <SecondaryButton
            onClick={() => sendTest("evening")}
            disabled={busy || !email.trim()}
          >
            Test evening
          </SecondaryButton>
        </div>
        {testMsg && (
          <p className="tiny" style={{ marginTop: 10 }}>
            {testMsg}
          </p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Calendars</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Paste secret subscribe links so Home can show today’s{" "}
          <strong>events</strong> (meetings, appointments). This is not your
          task list.
        </p>
        <label className="field">
          <span className="field-label">Apple Calendar (iCal) link</span>
          <input
            type="url"
            value={personalIcalUrl}
            onChange={(e) => setPersonalIcalUrl(e.target.value)}
            placeholder="https://… or webcal://…"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <p className="tiny muted" style={{ marginTop: 4 }}>
          On Mac: Calendar → File → New Calendar Subscription… / share a calendar
          and copy the private URL. On iPhone: Calendar → calendar info → Share
          Calendar → Public Calendar (or private server URL).
        </p>
        <label className="field" style={{ marginTop: 12 }}>
          <span className="field-label">Work Google Calendar link</span>
          <input
            type="url"
            value={workIcalUrl}
            onChange={(e) => setWorkIcalUrl(e.target.value)}
            placeholder="https://calendar.google.com/calendar/ical/…"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <p className="tiny muted" style={{ marginTop: 4 }}>
          Google Calendar → Settings → your work calendar → Integrate calendar →
          Secret address in iCal format.
        </p>
      </section>

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
        <p className="tiny" style={{ marginBottom: 10 }}>
          Toggle what shows on Today&apos;s Items. Add your own anytime.
        </p>
        {supports.map((s) => (
          <div key={s.type} className="support-edit">
            <div className="row">
              <label className="check-inline">
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={(e) =>
                    updateSupport(s.type, { enabled: e.target.checked })
                  }
                />
                <input
                  className="inline-label"
                  value={s.label}
                  maxLength={SUPPORT_LABEL_MAX}
                  onChange={(e) =>
                    updateSupport(s.type, {
                      label: e.target.value.slice(0, SUPPORT_LABEL_MAX),
                    })
                  }
                />
              </label>
              <label className="target-inline">
                <span className="tiny">/wk</span>
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={s.weeklyTarget}
                  onChange={(e) =>
                    updateSupport(s.type, {
                      weeklyTarget: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
          </div>
        ))}

        <div className="add-support">
          <p className="eyebrow">Add a support</p>
          <div className="add-support-row">
            <input
              value={newLabel}
              maxLength={SUPPORT_LABEL_MAX}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Walk, Meeting, Therapy"
            />
            <input
              type="number"
              min={0}
              max={14}
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              aria-label="Weekly target"
              style={{ width: 64 }}
            />
            <button type="button" className="btn ghost" onClick={addSupport}>
              Add
            </button>
          </div>
        </div>
      </section>

      {msg && <p className="chip good">{msg}</p>}
      <PrimaryButton onClick={save} disabled={busy}>
        Save settings
      </PrimaryButton>

      {env !== "prod" && (
        <SecondaryButton onClick={resetAll}>Reset all data (dev)</SecondaryButton>
      )}

      <section className="panel" style={{ marginTop: 8 }}>
        <p className="eyebrow">Journey</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Starts your clean-day count over tomorrow. Money, journals, and
          history stay.
        </p>
        <SecondaryButton onClick={resetJourney} disabled={busy}>
          Reset my journey
        </SecondaryButton>
      </section>
    </main>
  );
}
