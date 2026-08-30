"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  bundleJournalsByDate,
  fiveYearSlots,
  formatMonthDayLong,
  monthDayKey,
  shiftMonthDay,
  type DayKey,
} from "@/lib/journal";
import { missingEveningDates } from "@/lib/journey";

function photoSrc(photoId: string): string {
  return `/api/photos/${encodeURIComponent(photoId)}`;
}

function PaperclipIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export default function JournalPage() {
  const { state, today } = useApp();
  const anchorYear = today ? Number(today.slice(0, 4)) : new Date().getFullYear();
  const [dayKey, setDayKey] = useState<DayKey | null>(null);
  const [viewPhotoId, setViewPhotoId] = useState<string | null>(null);

  const activeDay: DayKey =
    dayKey ?? (today ? monthDayKey(today) : "01-01");

  const byDate = useMemo(
    () => bundleJournalsByDate(state.journals),
    [state.journals],
  );

  const slots = useMemo(
    () => fiveYearSlots(activeDay, byDate, anchorYear, 5),
    [activeDay, byDate, anchorYear],
  );

  const filledCount = slots.filter((s) => s.headline || s.summary).length;

  const missed = useMemo(() => {
    if (!today) return [];
    return missingEveningDates(state, today).filter((d) => d < today);
  }, [state, today]);

  const todaySlot = today ? slots.find((s) => s.date === today) : undefined;
  const canWriteToday =
    Boolean(today) &&
    monthDayKey(today!) === activeDay &&
    !state.evenings.some((e) => e.date === today);

  function go(delta: number) {
    setDayKey(shiftMonthDay(activeDay, delta, anchorYear));
  }

  const viewSrc = viewPhotoId ? photoSrc(viewPhotoId) : undefined;

  return (
    <main className="fy-journal fade-in">
      <header className="fy-journal-head">
        <p className="fy-journal-mark">Five years</p>
        <div className="fy-journal-nav">
          <button
            type="button"
            className="fy-journal-nav-btn"
            onClick={() => go(-1)}
            aria-label="Previous day"
          >
            ‹
          </button>
          <h1 className="fy-journal-title">{formatMonthDayLong(activeDay)}</h1>
          <button
            type="button"
            className="fy-journal-nav-btn"
            onClick={() => go(1)}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
        <p className="fy-journal-sub muted">
          Same day, every year — headline and a short note.
          {filledCount > 0 ? ` · ${filledCount} written` : ""}
        </p>
      </header>

      <article className="fy-page" key={activeDay}>
        <div className="fy-page-rule" aria-hidden />
        {slots.map((slot, i) => {
          const empty = !slot.headline && !slot.summary;
          const isToday = today === slot.date;
          return (
            <section
              key={slot.year}
              className={`fy-year${empty ? " is-empty" : ""}${isToday ? " is-today" : ""}`}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="fy-year-gutter">
                <span className="fy-year-num">{slot.year}</span>
                {slot.photoId && (
                  <button
                    type="button"
                    className="fy-photo-clip"
                    aria-label="View attached photo"
                    title="Has photo"
                    onClick={() => setViewPhotoId(slot.photoId!)}
                  >
                    <PaperclipIcon />
                  </button>
                )}
              </div>
              <div className="fy-year-body">
                {empty ? (
                  <p className="fy-blank">
                    {isToday && canWriteToday
                      ? "Waiting for today’s page…"
                      : "—"}
                  </p>
                ) : (
                  <>
                    {slot.headline && (
                      <h2 className="fy-headline">{slot.headline}</h2>
                    )}
                    {slot.summary && (
                      <p className="fy-summary">{slot.summary}</p>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </article>

      {canWriteToday && todaySlot && (
        <p className="fy-write">
          <Link href="/evening" className="fy-write-link">
            Write today’s headline →
          </Link>
        </p>
      )}

      {missed.length > 0 && (
        <p className="fy-catchup muted">
          <Link href={`/evening?date=${missed[0]}`} className="fy-catchup-link">
            {missed.length === 1
              ? "One day still open to catch up →"
              : `${missed.length} days still open to catch up →`}
          </Link>
        </p>
      )}

      {viewSrc && (
        <div
          className="fy-photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Journal photo"
          onClick={() => setViewPhotoId(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setViewPhotoId(null);
          }}
        >
          <button
            type="button"
            className="fy-photo-lightbox-close"
            aria-label="Close photo"
            onClick={() => setViewPhotoId(null)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={viewSrc}
            alt="Journal photo"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
