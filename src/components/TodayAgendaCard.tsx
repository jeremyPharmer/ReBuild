"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import type { WorkCalendarEvent } from "@/lib/work-calendar";

type AgendaResponse = {
  date: string;
  events: WorkCalendarEvent[];
  connected: boolean;
  errors?: string[];
  error?: string;
};

/**
 * Combined today’s calendar agenda on Home (RB-023).
 * Apple iCal + work Google events — not tasks/todos.
 */
export function TodayAgendaCard() {
  const { today, state } = useApp();
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const personal = state.profile?.personalIcalUrl?.trim();
  const work = state.profile?.workIcalUrl?.trim();
  const hasUrls = Boolean(personal || work);

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

  const events = data?.events ?? [];
  const connected = data?.connected ?? false;
  const showSetup = !loading && !connected && !hasUrls;

  return (
    <section className="home-card home-card-agenda" aria-label="Today's calendar">
      <div className="home-card-head">
        <p className="home-card-kicker">Calendar</p>
        <h2>Today</h2>
        <p className="tiny home-card-sub">
          Apple + work Google · events, not tasks
        </p>
      </div>

      {loading && <p className="muted tiny">Loading schedule…</p>}

      {!loading && showSetup && (
        <p className="muted">
          Paste your Apple Calendar and work Google Calendar links in{" "}
          <Link href="/settings">Settings</Link> to see today’s events here.
        </p>
      )}

      {!loading && connected && events.length === 0 && (
        <p className="muted">Nothing on the calendar today.</p>
      )}

      {!loading && events.length > 0 && (
        <ul className="agenda-list">
          {events.map((ev) => (
            <li key={ev.id} className="agenda-row">
              <span className="agenda-time">
                {ev.allDay
                  ? "All day"
                  : ev.endTime
                    ? `${ev.startTime}–${ev.endTime}`
                    : ev.startTime}
              </span>
              <span className="agenda-main">
                {ev.url ? (
                  <a href={ev.url} target="_blank" rel="noreferrer">
                    {ev.title}
                  </a>
                ) : (
                  <span>{ev.title}</span>
                )}
                {ev.location ? (
                  <span className="agenda-loc muted tiny">{ev.location}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!loading && data?.errors && data.errors.length > 0 && (
        <p className="tiny form-error" style={{ marginTop: 8 }}>
          {data.errors.join(" · ")}
        </p>
      )}
    </section>
  );
}
