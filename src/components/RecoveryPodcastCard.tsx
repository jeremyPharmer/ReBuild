"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  formatDuration,
  offeredPodcasts,
  type PodcastEpisode,
} from "@/lib/podcasts";

export function RecoveryPodcastCard() {
  const { state, today, post } = useApp();
  const offers = offeredPodcasts(state.listenedPodcasts);
  const [open, setOpen] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function markListened(ep: PodcastEpisode) {
    setBusyId(ep.id);
    setError("");
    try {
      if (playingId === ep.id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
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

  function togglePlay(ep: PodcastEpisode) {
    if (!ep.streamUrl) return;
    setError("");
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === ep.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = ep.streamUrl;
    void audio
      .play()
      .then(() => setPlayingId(ep.id))
      .catch(() => {
        setError("Couldn’t stream here — open in Podcasts instead.");
        setPlayingId(null);
        window.open(ep.appleUrl, "_blank", "noopener,noreferrer");
      });
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
        <>
          <audio
            ref={audioRef}
            preload="none"
            onEnded={() => setPlayingId(null)}
          />

          {offers.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>
              You’ve cleared this shelf for now.
            </p>
          ) : (
            <ul className="podcast-list">
              {offers.map((ep) => {
                const isPlaying = playingId === ep.id;
                return (
                  <li key={ep.id} className="podcast-row">
                    <div className="podcast-row-main">
                      <p className="podcast-show">{ep.show}</p>
                      <p className="podcast-title">{ep.title}</p>
                      <p className="tiny podcast-blurb">
                        {ep.blurb} · {formatDuration(ep.durationMin)}
                      </p>
                    </div>
                    <div className="podcast-row-actions">
                      {ep.streamUrl && (
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => togglePlay(ep)}
                        >
                          {isPlaying ? "Pause" : "Play"}
                        </button>
                      )}
                      <a
                        className="btn ghost"
                        href={ep.appleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        App
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
                );
              })}
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
        </>
      )}
    </section>
  );
}
