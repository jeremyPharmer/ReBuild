"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  formatDuration,
  pickRecoveryOffers,
  type RecoveryContentItem,
} from "@/lib/podcasts";

export function RecoveryPodcastCard() {
  const { state, today, post } = useApp();
  const listened = state.listenedPodcasts;
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [deal, setDeal] = useState<RecoveryContentItem[] | null>(null);

  const offers = useMemo(() => {
    const heard = new Set(listened ?? []);
    const base = deal ?? pickRecoveryOffers(listened);
    return base.filter((i) => !heard.has(i.id));
  }, [deal, listened]);

  async function markDone(item: RecoveryContentItem) {
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

  function shuffle() {
    setError("");
    setDeal(
      pickRecoveryOffers(listened, {
        excludeIds: offers.map((i) => i.id),
        shuffle: true,
      }),
    );
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
          <div className="podcast-toolbar">
            <p className="tiny" style={{ margin: 0 }}>
              3 podcasts · 2 articles
            </p>
            <button type="button" className="btn ghost podcast-shuffle" onClick={shuffle}>
              Shuffle
            </button>
          </div>

          {offers.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>
              You’ve cleared this shelf for now. Shuffle to recycle.
            </p>
          ) : (
            <ul className="podcast-list">
              {offers.map((item) => {
                const isArticle = item.kind === "article";
                return (
                  <li key={item.id} className="podcast-row">
                    <div className="podcast-row-main">
                      <p className="podcast-show">
                        {isArticle ? "Article" : "Podcast"} · {item.show}
                      </p>
                      <p className="podcast-title">{item.title}</p>
                      <p className="tiny podcast-blurb">
                        {item.blurb} · {formatDuration(item.durationMin)}
                        {isArticle ? " read" : ""}
                      </p>
                    </div>
                    <div className="podcast-row-actions">
                      <a
                        className="btn ghost"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isArticle ? "Read" : "Play"}
                      </a>
                      <button
                        type="button"
                        className="btn ghost"
                        disabled={busyId === item.id}
                        onClick={() => markDone(item)}
                      >
                        {isArticle ? "Done" : "Heard"}
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
        </div>
      )}
    </section>
  );
}
