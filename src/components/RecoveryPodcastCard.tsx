"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  CONTENT_OFFER_COUNT,
  formatDuration,
  pickRecoveryOffers,
  type RecoveryContentItem,
} from "@/lib/podcasts";

export function RecoveryPodcastCard() {
  const { state, today, post } = useApp();
  const listened = state.listenedPodcasts;
  const heard = new Set(listened ?? []);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [hand, setHand] = useState<RecoveryContentItem[] | null>(null);
  const [shuffleTick, setShuffleTick] = useState(0);

  const offers = hand ?? pickRecoveryOffers(listened);

  function expand() {
    setOpen((wasOpen) => !wasOpen);
    setHand((current) => current ?? pickRecoveryOffers(listened));
  }

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
    const current = hand ?? pickRecoveryOffers(listened);
    setHand(
      pickRecoveryOffers(listened, {
        excludeIds: current.map((i) => i.id),
        shuffle: true,
      }),
    );
    setShuffleTick((n) => n + 1);
  }

  return (
    <section className="panel podcast-card">
      <button
        type="button"
        className="podcast-toggle"
        aria-expanded={open}
        onClick={expand}
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
              {CONTENT_OFFER_COUNT} offers · shuffle for a new set
            </p>
            <button
              type="button"
              className="btn ghost podcast-shuffle"
              onClick={shuffle}
              aria-label="Shuffle five new recovery items"
            >
              Shuffle
            </button>
          </div>

          <ul className="podcast-list fade-in" key={shuffleTick}>
            {offers.map((item) => {
              const isArticle = item.kind === "article";
              const done = heard.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`podcast-row${done ? " heard" : ""}`}
                >
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
                      disabled={done || busyId === item.id}
                      onClick={() => markDone(item)}
                    >
                      {done
                        ? isArticle
                          ? "Done"
                          : "Heard"
                        : busyId === item.id
                          ? "…"
                          : isArticle
                            ? "Done"
                            : "Heard"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

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
