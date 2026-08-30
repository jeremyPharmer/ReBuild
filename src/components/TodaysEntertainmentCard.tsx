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
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const heardCount = items.filter((i) => heard.has(i.id)).length;
  const leftCount = items.length - heardCount;

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
    <section className="home-card home-card-entertainment">
      <button
        type="button"
        className="entertainment-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="entertainment-toggle-text">
          <p className="home-card-kicker">Listen</p>
          <h2>Today&apos;s Entertainment</h2>
          <p className="tiny home-card-sub">
            {leftCount === 0
              ? `${items.length} picks · all heard`
              : `${items.length} picks · ${leftCount} left · 1 recovery`}
          </p>
        </div>
        <span className={`podcast-caret${open ? " open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="entertainment-body fade-in">
          <ul className="content-picks">
            {items.map((item) => {
              const done = heard.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`content-pick${done ? " done" : ""}`}
                >
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
                      {done
                        ? "Heard"
                        : busyId === item.id
                          ? "…"
                          : "Mark heard"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {error && (
            <p
              className="tiny"
              style={{ color: "var(--danger)", marginTop: 8 }}
            >
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
