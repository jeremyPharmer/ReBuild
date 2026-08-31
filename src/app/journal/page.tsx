"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  JournalMonthCalendar,
  type JournalDayMark,
} from "@/components/journal/JournalMonthCalendar";
import { SubtlePhotoPicker } from "@/components/SubtlePhotoPicker";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  SUMMARY_SENTENCE_SOFT_LIMIT,
  bundleJournalsByDate,
  countSentences,
  fiveYearSlots,
  formatMonthDayLong,
  isStarredDay,
  monthDayKey,
  shiftMonthDay,
  type DayKey,
} from "@/lib/journal";
import {
  formatDisplayDate,
  missingEveningDates,
} from "@/lib/journey";
import { monthKey as toMonthKey } from "@/lib/workouts";

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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <span aria-hidden className={filled ? "fy-star-on" : "fy-star-off"}>
      {filled ? "★" : "☆"}
    </span>
  );
}

type Panel = "day" | "month" | "stars";

export default function JournalPage() {
  const { state, today, post } = useApp();
  const anchorYear = today
    ? Number(today.slice(0, 4))
    : new Date().getFullYear();
  const [dayKey, setDayKey] = useState<DayKey | null>(null);
  const [panel, setPanel] = useState<Panel>("day");
  const [calMonth, setCalMonth] = useState(() =>
    today ? today.slice(0, 7) : toMonthKey(anchorYear, 1),
  );
  const [viewPhotoId, setViewPhotoId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editHeadline, setEditHeadline] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [missedNotice, setMissedNotice] = useState<string | null>(null);

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

  const missedSet = useMemo(() => {
    const s = new Set(missed);
    if (today && !state.evenings.some((e) => e.date === today)) {
      s.add(today);
    }
    return s;
  }, [missed, today, state.evenings]);

  const closedSet = useMemo(
    () => new Set(state.evenings.map((e) => e.date)),
    [state.evenings],
  );

  const starredSet = useMemo(
    () => new Set(state.starredDays ?? []),
    [state.starredDays],
  );

  const dayMarks = useMemo(() => {
    const map = new Map<string, JournalDayMark>();
    const { year, month } = (() => {
      const [y, m] = calMonth.split("-").map(Number);
      return { year: y, month: m };
    })();
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${calMonth}-${String(d).padStart(2, "0")}`;
      if (closedSet.has(date) || byDate.has(date)) {
        map.set(date, "closed");
      } else if (missedSet.has(date)) {
        map.set(date, "missing");
      } else {
        map.set(date, "empty");
      }
    }
    return map;
  }, [calMonth, closedSet, byDate, missedSet]);

  const starredList = useMemo(() => {
    return [...(state.starredDays ?? [])]
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        headline: byDate.get(date)?.headline,
        summary: byDate.get(date)?.summary,
      }));
  }, [state.starredDays, byDate]);

  const todaySlot = today ? slots.find((s) => s.date === today) : undefined;
  const canWriteToday =
    Boolean(today) &&
    monthDayKey(today!) === activeDay &&
    !state.evenings.some((e) => e.date === today);

  const summarySentences = countSentences(editSummary);
  const summaryOver =
    editSummary.trim().length > 0 &&
    summarySentences > SUMMARY_SENTENCE_SOFT_LIMIT;

  function go(delta: number) {
    setDayKey(shiftMonthDay(activeDay, delta, anchorYear));
    setMissedNotice(null);
    setEditingDate(null);
  }

  function openDayFromCalendar(date: string) {
    setDayKey(monthDayKey(date));
    setPanel("day");
    setEditingDate(null);
    if (missedSet.has(date) && !closedSet.has(date)) {
      setMissedNotice(date);
    } else {
      setMissedNotice(null);
    }
  }

  function startEdit(date: string) {
    const bundle = byDate.get(date);
    const evening = state.evenings.find((e) => e.date === date);
    if (!evening && !bundle?.headline) {
      setMissedNotice(date);
      setError("");
      return;
    }
    setEditingDate(date);
    setEditHeadline(bundle?.headline ?? evening?.oneLine ?? "");
    setEditSummary(
      bundle?.summary ?? evening?.expandedJournal ?? "",
    );
    setEditPhoto(null);
    setError("");
    setMissedNotice(null);
  }

  async function saveEdit() {
    if (!editingDate) return;
    setBusy(true);
    setError("");
    try {
      await post("/api/journal", {
        action: "updateEntry",
        date: editingDate,
        oneLine: editHeadline,
        expandedJournal: editSummary,
        photoDataUrl: editPhoto || undefined,
      });
      setEditingDate(null);
      setEditPhoto(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function toggleStar(date: string) {
    setBusy(true);
    setError("");
    try {
      await post("/api/journal", { action: "toggleStar", date });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update star");
    } finally {
      setBusy(false);
    }
  }

  const viewSrc = viewPhotoId ? photoSrc(viewPhotoId) : undefined;

  return (
    <main className="fy-journal fade-in">
      <header className="fy-journal-head">
        <p className="fy-journal-mark">Five years</p>
        {panel === "day" ? (
          <>
            <div className="fy-journal-nav">
              <button
                type="button"
                className="fy-journal-nav-btn"
                onClick={() => go(-1)}
                aria-label="Previous day"
              >
                ‹
              </button>
              <h1 className="fy-journal-title">
                {formatMonthDayLong(activeDay)}
              </h1>
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
          </>
        ) : panel === "month" ? (
          <>
            <h1 className="fy-journal-title">Browse days</h1>
            <p className="fy-journal-sub muted">
              Tap a day to open its page. Stars mark days to remember.
            </p>
          </>
        ) : (
          <>
            <h1 className="fy-journal-title">Days to remember</h1>
            <p className="fy-journal-sub muted">
              Your starred journal days.
            </p>
          </>
        )}

        <div className="fy-journal-tools">
          <button
            type="button"
            className={`fy-tool-btn${panel === "month" ? " is-active" : ""}`}
            onClick={() => {
              setPanel(panel === "month" ? "day" : "month");
              if (today) setCalMonth(today.slice(0, 7));
            }}
          >
            {panel === "month" ? "Back to day" : "Month"}
          </button>
          <button
            type="button"
            className={`fy-tool-btn${panel === "stars" ? " is-active" : ""}`}
            onClick={() => setPanel(panel === "stars" ? "day" : "stars")}
          >
            Remembered
            {starredList.length > 0 ? ` · ${starredList.length}` : ""}
          </button>
        </div>
      </header>

      {panel === "month" && today && (
        <JournalMonthCalendar
          monthKey={calMonth}
          today={today}
          dayMarks={dayMarks}
          starredDays={starredSet}
          selectedDate={
            dayKey
              ? `${calMonth.slice(0, 4)}-${dayKey}`
              : today
          }
          onMonthChange={setCalMonth}
          onSelectDate={openDayFromCalendar}
        />
      )}

      {panel === "stars" && (
        <section className="fy-starred-list">
          {starredList.length === 0 ? (
            <p className="muted fy-starred-empty">
              Star a written day to keep it here.
            </p>
          ) : (
            <ul>
              {starredList.map((row) => (
                <li key={row.date}>
                  <button
                    type="button"
                    className="fy-starred-row"
                    onClick={() => openDayFromCalendar(row.date)}
                  >
                    <span className="fy-starred-meta">
                      <StarIcon filled />
                      <span>{formatDisplayDate(row.date)}</span>
                    </span>
                    <span className="fy-starred-headline">
                      {row.headline || "Untitled"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {panel === "day" && (
        <>
          {missedNotice && (
            <p className="fy-missed-notice">
              {formatDisplayDate(missedNotice)} isn’t closed yet.{" "}
              <Link href={`/evening?date=${missedNotice}`}>
                Close that day →
              </Link>
            </p>
          )}

          <article className="fy-page" key={activeDay}>
            <div className="fy-page-rule" aria-hidden />
            {slots.map((slot, i) => {
              const empty = !slot.headline && !slot.summary;
              const isToday = today === slot.date;
              const hasEvening = closedSet.has(slot.date);
              const starred = isStarredDay(state.starredDays, slot.date);
              const isEditing = editingDate === slot.date;
              const isMissed =
                !hasEvening &&
                missedSet.has(slot.date) &&
                empty;

              return (
                <section
                  key={slot.year}
                  className={`fy-year${empty ? " is-empty" : ""}${isToday ? " is-today" : ""}${starred ? " is-starred" : ""}`}
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
                    {hasEvening && (
                      <button
                        type="button"
                        className="fy-star-btn"
                        aria-label={
                          starred
                            ? "Unstar day to remember"
                            : "Star as day to remember"
                        }
                        disabled={busy}
                        onClick={() => void toggleStar(slot.date)}
                      >
                        <StarIcon filled={starred} />
                      </button>
                    )}
                  </div>
                  <div className="fy-year-body">
                    {isEditing ? (
                      <div className="fy-edit">
                        <label className="field">
                          <span className="field-label">Headline</span>
                          <input
                            type="text"
                            value={editHeadline}
                            onChange={(e) => setEditHeadline(e.target.value)}
                            maxLength={120}
                          />
                        </label>
                        <label className="field" style={{ marginTop: 10 }}>
                          <span className="field-label">Short summary</span>
                          <textarea
                            rows={4}
                            value={editSummary}
                            onChange={(e) => setEditSummary(e.target.value)}
                          />
                          <span
                            className="tiny"
                            style={{
                              marginTop: 6,
                              color: summaryOver ? "var(--warn)" : undefined,
                            }}
                          >
                            {summarySentences} / {SUMMARY_SENTENCE_SOFT_LIMIT}{" "}
                            sentences
                            {summaryOver ? " — trim a little if you can" : ""}
                          </span>
                        </label>
                        <div style={{ marginTop: 12 }}>
                          <span className="field-label">Photo · optional</span>
                          {slot.photoId && !editPhoto && (
                            <p className="muted" style={{ margin: "4px 0 8px" }}>
                              Already has a photo — pick a new one to replace.
                            </p>
                          )}
                          <SubtlePhotoPicker
                            preview={editPhoto}
                            onPick={setEditPhoto}
                            onClear={() => setEditPhoto(null)}
                            cameraLabel="Take a photo"
                            libraryLabel="Choose from Photos"
                          />
                        </div>
                        <div className="fy-edit-actions">
                          <PrimaryButton
                            disabled={busy || !editHeadline.trim()}
                            onClick={() => void saveEdit()}
                          >
                            Save
                          </PrimaryButton>
                          <SecondaryButton
                            disabled={busy}
                            onClick={() => {
                              setEditingDate(null);
                              setEditPhoto(null);
                            }}
                          >
                            Cancel
                          </SecondaryButton>
                        </div>
                      </div>
                    ) : empty ? (
                      <div>
                        <p className="fy-blank">
                          {isToday && canWriteToday
                            ? "Waiting for today’s page…"
                            : "—"}
                        </p>
                        {isMissed && (
                          <p className="fy-missed-inline">
                            <Link href={`/evening?date=${slot.date}`}>
                              Close this day →
                            </Link>
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {slot.headline && (
                          <h2 className="fy-headline">{slot.headline}</h2>
                        )}
                        {slot.summary && (
                          <p className="fy-summary">{slot.summary}</p>
                        )}
                        {hasEvening && (
                          <button
                            type="button"
                            className="fy-edit-link"
                            onClick={() => startEdit(slot.date)}
                          >
                            Edit
                          </button>
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
              <Link
                href={`/evening?date=${missed[0]}`}
                className="fy-catchup-link"
              >
                {missed.length === 1
                  ? "One day still open to catch up →"
                  : `${missed.length} days still open to catch up →`}
              </Link>
            </p>
          )}
        </>
      )}

      {error && (
        <p style={{ color: "var(--danger)", textAlign: "center" }}>{error}</p>
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
