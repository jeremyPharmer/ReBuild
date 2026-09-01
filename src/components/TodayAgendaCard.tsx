"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import {
  AgendaEventComposer,
  type AgendaEventPayload,
} from "@/components/AgendaEventComposer";
import {
  applyCalendarTitleOverrides,
  calendarHiddenEventIds,
  calendarTitleOverrides,
  displayCalendarTitle,
  filterHiddenCalendarEvents,
} from "@/lib/calendar-overrides";
import { isCustomAgendaId } from "@/lib/custom-agenda-shared";
import { addDays, parseDate } from "@/lib/journey";
import type { WorkCalendarEvent } from "@/lib/work-calendar";

type AgendaResponse = {
  date: string;
  events: WorkCalendarEvent[];
  connected: boolean;
  errors?: string[];
  error?: string;
};

function AgendaTime({ event }: { event: WorkCalendarEvent }) {
  if (event.allDay || event.startTime === "All day") {
    return <span className="agenda-time-label">All day</span>;
  }
  if (event.startTime === "Anytime") {
    return <span className="agenda-time-label">Anytime</span>;
  }
  if (event.endTime) {
    return (
      <>
        <span className="agenda-time-label">{event.startTime}</span>
        <span className="agenda-time-sep" aria-hidden="true">
          –
        </span>
        <span className="agenda-time-label">{event.endTime}</span>
      </>
    );
  }
  return <span className="agenda-time-label">{event.startTime}</span>;
}

function agendaDayHeading(viewDate: string, today: string): string {
  if (viewDate === today) return "Today";
  if (viewDate === addDays(today, 1)) return "Tomorrow";
  return parseDate(viewDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function AgendaEventRow({
  event,
  displayTitle,
  onSaveTitle,
  onRemove,
}: {
  event: WorkCalendarEvent;
  displayTitle: string;
  onSaveTitle: (title: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCustom = isCustomAgendaId(event.id);

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
    <li className={`agenda-item${isCustom ? " agenda-item-custom" : ""}`}>
      <div className="agenda-time">
        <AgendaTime event={event} />
      </div>
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
            <button
              type="button"
              className="agenda-hide-btn"
              aria-label={`Remove ${displayTitle}`}
              disabled={saving}
              onClick={() => void onRemove()}
            >
              ×
            </button>
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
  const [viewDate, setViewDate] = useState(today);
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addBusy, setAddBusy] = useState(false);

  const personal = state.profile?.personalIcalUrl?.trim();
  const work = state.profile?.workIcalUrl?.trim();
  const [googleConnected, setGoogleConnected] = useState(false);
  const hasFeeds = Boolean(personal || work || googleConnected);
  const customSig = JSON.stringify(state.customAgendaEvents ?? []);
  const overrides = calendarTitleOverrides(state);
  const hidden = calendarHiddenEventIds(state);
  const canGoBack = viewDate > today;

  useEffect(() => {
    setViewDate(today);
  }, [today]);

  useEffect(() => {
    let cancelled = false;
    async function loadGoogleStatus() {
      try {
        const res = await fetch("/api/calendar/google/status", {
          credentials: "include",
        });
        const json = (await res.json()) as { connected?: boolean };
        if (!cancelled) setGoogleConnected(Boolean(json.connected));
      } catch {
        if (!cancelled) setGoogleConnected(false);
      }
    }
    void loadGoogleStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/calendar/work?date=${encodeURIComponent(viewDate)}`,
        );
        const json = (await res.json()) as AgendaResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData({
            date: viewDate,
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
  }, [viewDate, personal, work, googleConnected, customSig]);

  const rawEvents = data?.events ?? [];
  const events = filterHiddenCalendarEvents(
    applyCalendarTitleOverrides(rawEvents, overrides),
    hidden,
  );
  const connected = data?.connected ?? false;
  const showSetup = !loading && !connected && !hasFeeds && events.length === 0;

  async function saveTitle(eventId: string, title: string) {
    if (isCustomAgendaId(eventId)) {
      await post("/api/calendar/custom", {
        action: "update",
        id: eventId,
        title,
      });
      return;
    }
    await post("/api/calendar/overrides", { eventId, title });
  }

  async function removeEvent(eventId: string) {
    if (isCustomAgendaId(eventId)) {
      await post("/api/calendar/custom", { action: "delete", id: eventId });
      return;
    }
    await post("/api/calendar/overrides", { eventId, hide: true });
  }

  async function addEvent(payload: AgendaEventPayload) {
    setAddBusy(true);
    try {
      await post("/api/calendar/custom", {
        action: "add",
        date: viewDate,
        title: payload.title,
        allDay: payload.allDay,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
      setAdding(false);
    } finally {
      setAddBusy(false);
    }
  }

  return (
    <section className="home-card home-card-agenda" aria-label="Today's calendar">
      <div className="home-card-head-row">
        <div className="home-card-head home-card-head-agenda">
          <p className="home-card-kicker">Calendar</p>
          <div className="agenda-day-nav">
            <button
              type="button"
              className="btn ghost workout-cal-arrow"
              aria-label="Previous day"
              disabled={!canGoBack || loading}
              onClick={() => setViewDate((d) => addDays(d, -1))}
            >
              ‹
            </button>
            <h2>{agendaDayHeading(viewDate, today)}</h2>
            <button
              type="button"
              className="btn ghost workout-cal-arrow"
              aria-label="Next day"
              disabled={loading}
              onClick={() => setViewDate((d) => addDays(d, 1))}
            >
              ›
            </button>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label="Add reminder or event"
          onClick={() => setAdding(true)}
        >
          +
        </button>
      </div>

      {adding && (
        <AgendaEventComposer
          busy={addBusy}
          onSubmit={addEvent}
          onCancel={() => setAdding(false)}
        />
      )}

      {loading && <p className="muted tiny">Loading…</p>}

      {!loading && showSetup && !adding && (
        <p className="muted">
          Add your own reminders with <strong>+</strong>, or connect calendars in{" "}
          <Link href="/settings">Settings</Link>.
        </p>
      )}

      {!loading && connected && events.length === 0 && !adding && (
        <p className="muted">Clear day — tap + to add something.</p>
      )}

      {!loading && events.length > 0 && (
        <ul className="agenda-list">
          {events.map((ev) => (
            <AgendaEventRow
              key={ev.id}
              event={ev}
              displayTitle={displayCalendarTitle(ev, overrides)}
              onSaveTitle={(title) => saveTitle(ev.id, title)}
              onRemove={() => removeEvent(ev.id)}
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
