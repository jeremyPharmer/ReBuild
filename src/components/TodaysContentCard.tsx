"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { formatDuration } from "@/lib/podcasts";
import { pickTodaysContent, type DailyContentItem } from "@/lib/daily-content";

function slotLabel(item: DailyContentItem): string {
  if (item.slot === "recovery") return "Recovery";
  return item.show;
}

export function TodaysContentCard() {
  const { state, today, post } = useApp();
  const heard = new Set(state.listenedPodcasts ?? []);
  const items = pickTodaysContent(today, state.listenedPodcasts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function markHeard(item: DailyContentItem) {
    setBusyId(item.id);
    setError("");
    try {
      await post("/api/podcasts", {
        action: "listened",
        id: item.id,
        date: today,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="home-card home-card-content">
      <div className="home-card-head">
        <p className="home-card-kicker">Listen</p>
        <h2>Today&apos;s Content</h2>
        <p className="tiny home-card-sub">
          1 recovery · 2 rotating picks · refreshes daily
        </p>
      </div>

      <ul className="content-picks">
        {items.map((item) => {
          const done = heard.has(item.id);
          return (
            <li key={item.id} className={`content-pick${done ? " done" : ""}`}>
              <div className="content-pick-main">
                <span className="content-pick-tag">{slotLabel(item)}</span>
                <p className="content-pick-title">{item.title}</p>
                <p className="tiny content-pick-meta">
                  {item.blurb} · {formatDuration(item.durationMin)}
                </p>
              </div>
              <div className="content-pick-actions">
                <a
                  className="btn ghost"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Play
                </a>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={done || busyId === item.id}
                  onClick={() => markHeard(item)}
                >
                  {done ? "Heard" : busyId === item.id ? "…" : "Mark heard"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="tiny" style={{ color: "var(--danger)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </section>
  );
}
