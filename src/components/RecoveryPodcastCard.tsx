"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  formatDuration,
  offeredPodcasts,
  type PodcastEpisode,
} from "@/lib/podcasts";

export function RecoveryPodcastCard() {
  const { state, today, post } = useApp();
  const offers = offeredPodcasts(state.listenedPodcasts);
  // Collapsed by default on Home.
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function markListened(ep: PodcastEpisode) {
    setBusyId(ep.id);
    setError("");
    try {
      await post("/api/podcasts", {
        action: "listened",
        id: ep.id,
        date: today,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="panel podcast-card">
      <button
        type="button"
        className="podcast-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <h2>Recovery Content</h2>
        <span className={`podcast-caret${open ? " open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="podcast-body fade-in">
          {offers.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>
              You’ve cleared this shelf for now.
            </p>
          ) : (
            <ul className="podcast-list">
              {offers.map((ep) => (
                <li key={ep.id} className="podcast-row">
                  <div className="podcast-row-main">
                    <p className="podcast-show">{ep.show}</p>
                    <p className="podcast-title">{ep.title}</p>
                    <p className="tiny podcast-blurb">
                      {ep.blurb} · {formatDuration(ep.durationMin)}
                    </p>
                  </div>
                  <div className="podcast-row-actions">
                    <a
                      className="btn ghost"
                      href={ep.appleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Play
                    </a>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={busyId === ep.id}
                      onClick={() => markListened(ep)}
                    >
                      Heard
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p
              className="tiny"
              style={{ color: "var(--danger)", marginTop: 10 }}
            >
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
