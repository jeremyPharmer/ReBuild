"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reward, User } from "@/lib/incentives";

const USER_KEY = "rebuild:userId";

const GOALS = [
  "Sobriety",
  "Quit smoking",
  "Better sleep",
  "Daily exercise",
  "Mindfulness",
];

type Message = { kind: "success" | "error" | "info"; text: string } | null;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  // Onboarding form state.
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);

  const loadRewards = useCallback(async () => {
    const res = await fetch("/api/rewards");
    const data = await res.json();
    setRewards(data.rewards);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      await loadRewards();
      const id = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
      if (id) {
        const res = await fetch(`/api/profile?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUser(data.user);
        } else {
          localStorage.removeItem(USER_KEY);
        }
      }
      if (!cancelled) setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [loadRewards]);

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create profile");
      localStorage.setItem(USER_KEY, data.user.id);
      setUser(data.user);
      setMessage({ kind: "success", text: `Welcome, ${data.user.name}! Your journey starts now.` });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckIn() {
    if (!user) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "ALREADY_CHECKED_IN") {
          setMessage({ kind: "info", text: "You've already checked in today. See you tomorrow!" });
          return;
        }
        throw new Error(data.error ?? "Check-in failed");
      }
      setUser(data.user);
      const bonusText = data.bonus > 0 ? ` 🎉 Milestone bonus: +${data.bonus}!` : "";
      setMessage({
        kind: "success",
        text: `Checked in! +${data.awarded} points. Streak: ${data.user.streak} day(s).${bonusText}`,
      });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function handleRedeem(reward: Reward) {
    if (!user) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, rewardId: reward.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "INSUFFICIENT_POINTS") {
          setMessage({ kind: "error", text: `Not enough points for ${reward.name}. Keep going!` });
          return;
        }
        throw new Error(data.error ?? "Redeem failed");
      }
      setUser(data.user);
      setMessage({ kind: "success", text: `Redeemed ${reward.name}! Enjoy — you earned it.` });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setName("");
    setMessage(null);
  }

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = user?.lastCheckIn === today;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ReBuild</h1>
            <p className="text-white/70">Recovery, one day at a time — with rewards.</p>
          </div>
          {user && (
            <button
              onClick={handleReset}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/20"
            >
              Sign out
            </button>
          )}
        </header>

        {message && (
          <div
            role="status"
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              message.kind === "success"
                ? "bg-emerald-500/90 text-white"
                : message.kind === "error"
                  ? "bg-red-500/90 text-white"
                  : "bg-white/20 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-white/80">Loading…</p>
        ) : !user ? (
          <section className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <h2 className="mb-1 text-xl font-semibold">Create your profile</h2>
            <p className="mb-5 text-white/70">Tell us your name and what you&apos;re working toward.</p>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-white/80">
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label htmlFor="goal" className="mb-1 block text-sm font-medium text-white/80">
                  Recovery goal
                </label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-white"
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="w-full rounded-lg bg-white px-4 py-2.5 font-semibold text-indigo-700 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Creating…" : "Start my journey"}
              </button>
            </form>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl bg-white/10 p-6 backdrop-blur">
              <p className="text-white/70">
                Goal: <span className="font-semibold text-white">{user.goal}</span>
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <Stat label="Current streak" value={`${user.streak} 🔥`} />
                <Stat label="Longest streak" value={`${user.longestStreak}`} />
                <Stat label="Points" value={`${user.points} ⭐`} />
              </div>
              <button
                onClick={handleCheckIn}
                disabled={busy || checkedInToday}
                className="mt-6 w-full rounded-xl bg-emerald-400 px-4 py-3 text-lg font-bold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkedInToday ? "✓ Checked in today" : "Check in for today (+10 pts)"}
              </button>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Rewards store</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {rewards.map((reward) => {
                  const affordable = user.points >= reward.cost;
                  return (
                    <div
                      key={reward.id}
                      className="flex flex-col rounded-2xl bg-white/10 p-4 backdrop-blur"
                    >
                      <div className="mb-2 text-3xl">{reward.emoji}</div>
                      <h3 className="font-semibold">{reward.name}</h3>
                      <p className="mb-3 flex-1 text-sm text-white/70">{reward.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{reward.cost} ⭐</span>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={busy || !affordable}
                          className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {affordable ? "Redeem" : "Locked"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {user.redemptions.length > 0 && (
              <section className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <h2 className="mb-3 text-xl font-semibold">Redeemed rewards</h2>
                <ul className="space-y-2">
                  {user.redemptions.map((r, i) => (
                    <li key={i} className="flex justify-between text-sm text-white/80">
                      <span>{r.name}</span>
                      <span>-{r.cost} ⭐</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-white/60">{label}</div>
    </div>
  );
}
