"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import {
  applyCalendarTitleOverrides,
  calendarTitleOverrides,
  displayCalendarTitle,
} from "@/lib/calendar-overrides";
import type { WorkCalendarEvent } from "@/lib/work-calendar";

type AgendaResponse = {
  date: string;
  events: WorkCalendarEvent[];
  connected: boolean;
  errors?: string[];
  error?: string;
};

function formatTimeRange(ev: WorkCalendarEvent): string {
  if (ev.allDay) return "All day";
  if (ev.endTime) return `${ev.startTime}–${ev.endTime}`;
  return ev.startTime;
}

function AgendaEventRow({
  event,
  displayTitle,
  onSaveTitle,
}: {
  event: WorkCalendarEvent;
  displayTitle: string;
  onSaveTitle: (title: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(displayTitle);
  }, [displayTitle, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function commit() {
    const next = draft.trim();
    setEditing(false);
    if (next === displayTitle.trim()) return;
    setSaving(true);
    try {
      await onSaveTitle(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="agenda-item">
      <span className="agenda-time">{formatTimeRange(event)}</span>
      <div className="agenda-body">
        {editing ? (
          <input
            ref={inputRef}
            className="agenda-title-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => void commit()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void commit();
              }
              if (e.key === "Escape") {
                setDraft(displayTitle);
                setEditing(false);
              }
            }}
            maxLength={120}
            aria-label="Event name"
          />
        ) : (
          <div className="agenda-title-row">
            <button
              type="button"
              className="agenda-title-btn"
              onClick={() => setEditing(true)}
              disabled={saving}
            >
              {displayTitle}
            </button>
            {event.url ? (
              <a
                className="agenda-open-link"
                href={event.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${displayTitle}`}
              >
                ↗
              </a>
            ) : null}
          </div>
        )}
        {event.location ? (
          <p className="agenda-loc">{event.location}</p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Combined today’s calendar agenda on Home (RB-023).
 */
export function TodayAgendaCard() {
  const { today, state, post } = useApp();
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const personal = state.profile?.personalIcalUrl?.trim();
  const work = state.profile?.workIcalUrl?.trim();
  const hasUrls = Boolean(personal || work);
  const overrides = calendarTitleOverrides(state);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/calendar/work?date=${encodeURIComponent(today)}`,
        );
        const json = (await res.json()) as AgendaResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData({
            date: today,
            events: [],
            connected: false,
            error: "Could not load calendar",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [today, personal, work]);

  const rawEvents = data?.events ?? [];
  const events = applyCalendarTitleOverrides(rawEvents, overrides);
  const connected = data?.connected ?? false;
  const showSetup = !loading && !connected && !hasUrls;
  const showCard =
    loading || showSetup || connected || (data?.errors?.length ?? 0) > 0;

  if (!showCard && events.length === 0) return null;

  async function saveTitle(eventId: string, title: string) {
    await post("/api/calendar/overrides", { eventId, title });
  }

  return (
    <section className="home-card home-card-agenda" aria-label="Today's calendar">
      <div className="home-card-head">
        <p className="home-card-kicker">Calendar</p>
        <h2>Today</h2>
      </div>

      {loading && <p className="muted tiny">Loading…</p>}

      {!loading && showSetup && (
        <p className="muted">
          Add calendar links in <Link href="/settings">Settings</Link>.
        </p>
      )}

      {!loading && connected && events.length === 0 && (
        <p className="muted">Clear day.</p>
      )}

      {!loading && events.length > 0 && (
        <ul className="agenda-list">
          {events.map((ev) => (
            <AgendaEventRow
              key={ev.id}
              event={ev}
              displayTitle={displayCalendarTitle(ev, overrides)}
              onSaveTitle={(title) => saveTitle(ev.id, title)}
            />
          ))}
        </ul>
      )}

      {!loading && data?.errors && data.errors.length > 0 && (
        <p className="tiny form-error">{data.errors.join(" · ")}</p>
      )}
    </section>
  );
}
