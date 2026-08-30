"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { formatDuration } from "@/lib/podcasts";
import { pickTodaysContent, type DailyContentItem } from "@/lib/daily-content";

function slotLabel(item: DailyContentItem): string {
  if (item.slot === "recovery") return "Recovery";
  return item.show;
}

export function TodaysEntertainmentCard() {
  const { state, today, post } = useApp();
  const heard = new Set(state.listenedPodcasts ?? []);
  const items = pickTodaysContent(today, state.listenedPodcasts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  function toggleRow(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <section className="home-card home-card-entertainment radio-feed">
      <div className="radio-feed-header">
        <span className="radio-on-air" aria-hidden>
          <span className="radio-on-air-dot" />
          ON AIR
        </span>
        <h2>Today&apos;s Entertainment</h2>
      </div>

      <ul className="radio-feed-list">
        {items.map((item, index) => {
          const done = heard.has(item.id);
          const open = expandedId === item.id;
          return (
            <li
              key={item.id}
              className={`radio-feed-item${open ? " open" : ""}${done ? " done" : ""}`}
              style={{ ["--feed-i" as string]: index }}
            >
              <button
                type="button"
                className="radio-feed-row"
                aria-expanded={open}
                onClick={() => toggleRow(item.id)}
              >
                <span className="radio-feed-show">{slotLabel(item)}</span>
                <span className="radio-feed-title">{item.title}</span>
                <span className="radio-feed-time">
                  {done ? "✓ " : ""}
                  {formatDuration(item.durationMin)}
                </span>
              </button>

              {open && (
                <div className="radio-feed-detail fade-in">
                  <p className="tiny radio-feed-blurb">{item.blurb}</p>
                  <div className="radio-feed-actions">
                    <a
                      className="btn ghost radio-feed-play"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ▶ Play
                    </a>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={done || busyId === item.id}
                      onClick={() => markHeard(item)}
                    >
                      {done
                        ? "Heard"
                        : busyId === item.id
                          ? "…"
                          : "Mark heard"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="tiny" style={{ color: "var(--danger)", marginTop: 6 }}>
          {error}
        </p>
      )}
    </section>
  );
}
