"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { homeDayPrimary, homeDaySecondary } from "@/lib/home-day-nav";
import { addDays } from "@/lib/journey";
import { dayAbbrev } from "@/lib/weather";
import type { WorkCalendarEvent } from "@/lib/work-calendar";

const AGENDA_SPAN_KEY = "jeremyos-agenda-span";
type AgendaSpan = "1" | "3";

function readAgendaSpan(): AgendaSpan {
  try {
    const raw = localStorage.getItem(AGENDA_SPAN_KEY);
    if (raw === "1" || raw === "3") return raw;
  } catch {
    /* ignore */
  }
  return "3";
}

type AgendaResponse = {
  date: string;
  events: WorkCalendarEvent[];
  connected: boolean;
  errors?: string[];
  error?: string;
};

type AgendaTimeParts = {
  start: string;
  end?: string;
  joinable: boolean;
};

function agendaTimeParts(event: WorkCalendarEvent): AgendaTimeParts {
  if (event.allDay || event.startTime === "All day") {
    return { start: "All day", joinable: Boolean(event.url) };
  }
  if (event.startTime === "Anytime") {
    return { start: "Anytime", joinable: Boolean(event.url) };
  }
  return {
    start: event.startTime,
    end: event.endTime,
    joinable: Boolean(event.url),
  };
}

function shouldShowLocation(event: WorkCalendarEvent): boolean {
  if (!event.location) return false;
  if (!event.url) return true;
  const loc = event.location.toLowerCase();
  if (
    loc.includes("google meet") ||
    loc.includes("zoom") ||
    loc.includes("teams")
  ) {
    return false;
  }
  return true;
}

function AgendaTime({ event }: { event: WorkCalendarEvent }) {
  const { start, end, joinable } = agendaTimeParts(event);
  const hasEnd = Boolean(end && end !== start);
  const label = hasEnd ? `${start} to ${end}` : start;

  const content = (
    <>
      <span className="agenda-time-start">{start}</span>
      {hasEnd ? <span className="agenda-time-end">{end}</span> : null}
      {joinable ? (
        <span className="agenda-time-join" aria-hidden="true">
          Join
        </span>
      ) : null}
    </>
  );

  if (joinable && event.url) {
    return (
      <a
        className="agenda-time-block agenda-time-link"
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Join ${event.title} at ${label}`}
      >
        {content}
      </a>
    );
  }

  return <div className="agenda-time-block">{content}</div>;
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
    <li
      className={`agenda-item${isCustom ? " agenda-item-custom" : ""}${
        event.url ? " agenda-item-joinable" : ""
      }`}
    >
      <AgendaTime event={event} />
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
          <button
            type="button"
            className="agenda-title-btn"
            onClick={() => setEditing(true)}
            disabled={saving}
          >
            {displayTitle}
          </button>
        )}
        {shouldShowLocation(event) ? (
          <p className="agenda-loc">{event.location}</p>
        ) : null}
      </div>
      {!editing ? (
        <button
          type="button"
          className="agenda-hide-btn"
          aria-label={`Remove ${displayTitle}`}
          disabled={saving}
          onClick={() => void onRemove()}
        >
          ×
        </button>
      ) : null}
    </li>
  );
}

/**
 * Combined today’s calendar agenda on Home (RB-023).
 */
export function TodayAgendaCard() {
  const { today, state, post } = useApp();
  const [viewDate, setViewDate] = useState(today);
  const [span, setSpan] = useState<AgendaSpan>("3");
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [stripCounts, setStripCounts] = useState<Record<string, number>>({});

  const personal = state.profile?.personalIcalUrl?.trim();
  const work = state.profile?.workIcalUrl?.trim();
  const extrasKey = (state.profile?.extraIcalUrls ?? [])
    .map((u) => u.trim())
    .filter(Boolean)
    .join("\n");
  const [googleConnected, setGoogleConnected] = useState(false);
  const hasFeeds = Boolean(personal || work || extrasKey || googleConnected);
  const customSig = JSON.stringify(state.customAgendaEvents ?? []);
  const overrides = calendarTitleOverrides(state);
  const hidden = calendarHiddenEventIds(state);
  const onToday = viewDate === today;
  const stripDays = useMemo(
    () => [today, addDays(today, 1), addDays(today, 2)] as const,
    [today],
  );

  useEffect(() => {
    setSpan(readAgendaSpan());
  }, []);

  useEffect(() => {
    setViewDate(today);
  }, [today]);

  useEffect(() => {
    if (span !== "3") return;
    if (!stripDays.includes(viewDate as (typeof stripDays)[number])) {
      setViewDate(today);
    }
  }, [today, stripDays, viewDate, span]);

  function chooseSpan(next: AgendaSpan) {
    setSpan(next);
    try {
      localStorage.setItem(AGENDA_SPAN_KEY, next);
    } catch {
      /* ignore */
    }
    if (next === "3" && !stripDays.includes(viewDate as (typeof stripDays)[number])) {
      setViewDate(today);
    }
  }

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
  }, [viewDate, personal, work, extrasKey, googleConnected, customSig]);

  useEffect(() => {
    if (span !== "3") return;
    let cancelled = false;
    async function loadStrip() {
      const entries = await Promise.all(
        stripDays.map(async (date) => {
          try {
            const res = await fetch(
              `/api/calendar/work?date=${encodeURIComponent(date)}`,
            );
            const json = (await res.json()) as AgendaResponse;
            const visible = filterHiddenCalendarEvents(
              applyCalendarTitleOverrides(json.events ?? [], overrides),
              hidden,
            );
            return [date, visible.length] as const;
          } catch {
            return [date, 0] as const;
          }
        }),
      );
      if (!cancelled) {
        setStripCounts(Object.fromEntries(entries));
      }
    }
    void loadStrip();
    return () => {
      cancelled = true;
    };
  }, [span, stripDays, personal, work, extrasKey, googleConnected, customSig, overrides, hidden]);

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
      <header className="agenda-header">
        <div className="agenda-header-top">
          <p className="home-card-kicker">Calendar</p>
          <div className="agenda-header-actions">
            <div className="tasks-span-toggle" role="group" aria-label="Calendar view">
              <button
                type="button"
                className={`tasks-span-btn${span === "1" ? " on" : ""}`}
                aria-pressed={span === "1"}
                onClick={() => chooseSpan("1")}
              >
                1 day
              </button>
              <button
                type="button"
                className={`tasks-span-btn${span === "3" ? " on" : ""}`}
                aria-pressed={span === "3"}
                onClick={() => chooseSpan("3")}
              >
                3 day
              </button>
            </div>
            {!onToday ? (
              <button
                type="button"
                className="agenda-today-btn"
                disabled={loading}
                onClick={() => setViewDate(today)}
              >
                Today
              </button>
            ) : null}
            <button
              type="button"
              className="icon-btn"
              aria-label="Add reminder or event"
              onClick={() => setAdding(true)}
            >
              +
            </button>
          </div>
        </div>

        {span === "3" ? (
          <div
            className="tasks-day-strip"
            role="tablist"
            aria-label="Next three days"
          >
            {stripDays.map((date) => {
              const selected = date === viewDate;
              const count = stripCounts[date] ?? 0;
              const label = date === today ? "Today" : dayAbbrev(date);
              return (
                <button
                  key={date}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`tasks-day-chip${selected ? " selected" : ""}`}
                  onClick={() => setViewDate(date)}
                >
                  <span className="tasks-day-chip-label">{label}</span>
                  <span className="tasks-day-chip-status" aria-hidden>
                    {count === 0 ? "—" : String(count)}
                  </span>
                  <span className="sr-only">
                    {count === 0 ? "no events" : `${count} events`}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="agenda-toolbar">
            <button
              type="button"
              className="btn ghost workout-cal-arrow agenda-toolbar-arrow"
              aria-label="Previous day"
              disabled={loading}
              onClick={() => setViewDate((d) => addDays(d, -1))}
            >
              ‹
            </button>

            <div className="agenda-toolbar-date" aria-live="polite">
              <span className="agenda-date-primary">
                {homeDayPrimary(viewDate, today)}
              </span>
              <span className="agenda-date-secondary">
                {homeDaySecondary(viewDate)}
              </span>
            </div>

            <button
              type="button"
              className="btn ghost workout-cal-arrow agenda-toolbar-arrow"
              aria-label="Next day"
              disabled={loading}
              onClick={() => setViewDate((d) => addDays(d, 1))}
            >
              ›
            </button>
          </div>
        )}
      </header>

      {adding && (
        <AgendaEventComposer
          busy={addBusy}
          onSubmit={addEvent}
          onCancel={() => setAdding(false)}
        />
      )}

      {loading && <p className="muted tiny agenda-status">Loading…</p>}

      {!loading && showSetup && !adding && (
        <p className="muted agenda-status">
          Add your own reminders with <strong>+</strong>, or connect calendars in{" "}
          <Link href="/settings">Settings</Link>.
        </p>
      )}

      {!loading && connected && events.length === 0 && !adding && (
        <p className="muted agenda-status">Clear day — tap + to add something.</p>
      )}

      {!loading && events.length > 0 && (
        <div className="agenda-schedule">
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
        </div>
      )}

      {!loading && data?.errors && data.errors.length > 0 && (
        <p className="tiny form-error">{data.errors.join(" · ")}</p>
      )}
    </section>
  );
}
