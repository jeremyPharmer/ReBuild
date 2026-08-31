"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { truncateSupportLabel } from "@/lib/auth-constants";
import type { SupportType } from "@/lib/types";

type SkipKey = SupportType | "morning" | "evening";

type DismissingItem = {
  key: SkipKey;
  label: string;
  meta?: string;
};

type ExitingSupport = {
  type: SupportType;
  label: string;
  weekDone: number;
  weeklyTarget: number;
};

type CalendarEventRow = {
  id: string;
  uid: string;
  title: string;
  startTime: string | null;
  endTime?: string | null;
  allDay: boolean;
  location?: string;
  description?: string;
  url?: string;
  calendarName: string;
  calendarColor: string;
  recurring: boolean;
  completed: boolean;
};

function DismissingTaskRow({ label, meta }: { label: string; meta?: string }) {
  return (
    <div
      className="check-item check-item-row dismissing"
      aria-live="polite"
      aria-label={`${label} — not today`}
    >
      <div className="check-item-main" aria-hidden>
        <span className="check-box" />
        <span className="check-label">
          <span className="check-label-name">{label}</span>
          {meta ? <span className="check-label-meta">{meta}</span> : null}
        </span>
      </div>
    </div>
  );
}

export function TodayRebuildPanel() {
  const { state, dashboard, today, post } = useApp();
  const [busyType, setBusyType] = useState<SupportType | null>(null);
  const [skipBusy, setSkipBusy] = useState<SkipKey | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoBusy, setUndoBusy] = useState<string | null>(null);
  const [exiting, setExiting] = useState<ExitingSupport[]>([]);
  const [dismissing, setDismissing] = useState<DismissingItem[]>([]);
  const [calEvents, setCalEvents] = useState<CalendarEventRow[]>([]);
  const [calExpanded, setCalExpanded] = useState<string | null>(null);
  const [calExiting, setCalExiting] = useState<string[]>([]);
  const [calBusy, setCalBusy] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/calendar/apple?date=${encodeURIComponent(today)}`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        connected?: boolean;
        events?: CalendarEventRow[];
      };
      setCalEvents(data.events ?? []);
    } catch {
      /* ignore — panel still works without calendar */
    }
  }, [today]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  if (!dashboard || !state.profile) return null;

  const skips = new Set(dashboard.todaySkips ?? []);
  const enabledSupports = state.profile.supports.filter((s) => s.enabled);
  const completedSupportTypes = new Set(
    dashboard.todaySupports.map((t) => t.supportType),
  );
  const exitingTypes = new Set(exiting.map((e) => e.type));
  const dismissingKeys = new Set(dismissing.map((d) => d.key));
  const openSupports = enabledSupports.filter(
    (s) =>
      !skips.has(s.type) &&
      !completedSupportTypes.has(s.type) &&
      !exitingTypes.has(s.type) &&
      !dismissingKeys.has(s.type),
  );
  const todayProvisions = (state.dayProvisions ?? []).filter(
    (p) => p.date === today,
  );
  const openProvisions = todayProvisions.filter((p) => !p.completed);
  const completedProvisions = todayProvisions.filter((p) => p.completed);
  const morningSkipped = skips.has("morning");
  const eveningSkipped = skips.has("evening");
  const morningDone = Boolean(dashboard.todayMorning);
  const eveningDone = Boolean(dashboard.todayEvening);
  const showMorningOpen =
    !morningDone && !morningSkipped && !dismissingKeys.has("morning");
  const showEveningOpen =
    !eveningDone && !eveningSkipped && !dismissingKeys.has("evening");

  const openCalEvents = calEvents.filter(
    (e) => !e.completed && !calExiting.includes(e.id),
  );
  const completedCalEvents = calEvents.filter((e) => e.completed);
  const calExitingRows = calEvents.filter((e) => calExiting.includes(e.id));

  const openCount =
    (showMorningOpen ? 1 : 0) +
    openCalEvents.length +
    calExitingRows.length +
    openSupports.length +
    openProvisions.length +
    exiting.length +
    dismissing.length +
    (showEveningOpen ? 1 : 0);

  const completedSupports = dashboard.todaySupports;
  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems =
    completedSupports.length > 0 ||
    completedProvisions.length > 0 ||
    completedCalEvents.length > 0 ||
    skippedToday.length > 0 ||
    morningDone ||
    eveningDone;

  async function completeSupport(item: ExitingSupport) {
    setBusyType(item.type);
    setExiting((prev) =>
      prev.some((e) => e.type === item.type) ? prev : [...prev, item],
    );
    try {
      await Promise.all([
        post("/api/support", {
          date: today,
          supportType: item.type,
          completed: true,
        }),
        new Promise((r) => setTimeout(r, 700)),
      ]);
    } finally {
      setExiting((prev) => prev.filter((e) => e.type !== item.type));
      setBusyType(null);
    }
  }

  async function dismissItem(item: DismissingItem) {
    setDismissing((prev) =>
      prev.some((d) => d.key === item.key) ? prev : [...prev, item],
    );
    setSkipBusy(item.key);
    try {
      await Promise.all([
        post("/api/skip", { date: today, itemKey: item.key }),
        new Promise((r) => setTimeout(r, 700)),
      ]);
    } finally {
      setDismissing((prev) => prev.filter((d) => d.key !== item.key));
      setSkipBusy(null);
    }
  }

  async function undoSupport(type: SupportType) {
    setUndoBusy(type);
    try {
      await post("/api/support", {
        date: today,
        supportType: type,
        completed: false,
      });
    } finally {
      setUndoBusy(null);
    }
  }

  async function undoSkip(itemKey: SkipKey) {
    setUndoBusy(`skip:${itemKey}`);
    try {
      await post("/api/skip", { date: today, itemKey, clear: true });
    } finally {
      setUndoBusy(null);
    }
  }

  async function undoMorning() {
    setUndoBusy("morning");
    try {
      await post("/api/morning", { action: "undo", date: today });
    } finally {
      setUndoBusy(null);
    }
  }

  async function completeProvision(id: string) {
    setUndoBusy(`prov:${id}`);
    try {
      await post("/api/day-provision", {
        action: "complete",
        id,
        date: today,
      });
    } finally {
      setUndoBusy(null);
    }
  }

  async function undoProvision(id: string) {
    setUndoBusy(`prov:${id}`);
    try {
      await post("/api/day-provision", {
        action: "undo",
        id,
        date: today,
      });
    } finally {
      setUndoBusy(null);
    }
  }

  async function completeCalendar(id: string) {
    setCalBusy(id);
    setCalExiting((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCalExpanded((prev) => (prev === id ? null : prev));
    try {
      await Promise.all([
        post("/api/calendar/apple", { action: "complete", id }),
        new Promise((r) => setTimeout(r, 700)),
      ]);
      setCalEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, completed: true } : e)),
      );
    } finally {
      setCalExiting((prev) => prev.filter((x) => x !== id));
      setCalBusy(null);
    }
  }

  async function undoCalendar(id: string) {
    setUndoBusy(`cal:${id}`);
    try {
      await post("/api/calendar/apple", { action: "undo", id });
      setCalEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, completed: false } : e)),
      );
    } finally {
      setUndoBusy(null);
    }
  }

  function supportLabel(type: string) {
    return (
      state.profile?.supports.find((s) => s.type === type)?.label ?? type
    );
  }

  function itemLabel(key: string) {
    if (key === "morning") return "Start the day";
    if (key === "evening") return "Close the day";
    return supportLabel(key);
  }

  function calTimeLabel(e: CalendarEventRow) {
    if (e.allDay || !e.startTime) return "All day";
    return e.startTime;
  }

  function renderCalendarRow(e: CalendarEventRow, exitingRow: boolean) {
    const expanded = calExpanded === e.id;
    const hasDetail = Boolean(
      e.location || e.description || e.endTime || e.url || e.calendarName,
    );
    return (
      <div key={e.id}>
        <div
          className={`check-item check-item-row cal-row${exitingRow ? " clearing" : ""}`}
          style={{ ["--cal-color" as string]: e.calendarColor }}
          aria-live={exitingRow ? "polite" : undefined}
        >
          <button
            type="button"
            className="check-item-main"
            disabled={calBusy === e.id || exitingRow}
            onClick={() => completeCalendar(e.id)}
            aria-label={`Complete ${e.title}`}
          >
            <span className={`check-box${exitingRow ? " checked" : ""}`}>
              {exitingRow ? "✓" : null}
            </span>
            <span className="check-label cal-label">
              <span className="check-label-meta">{calTimeLabel(e)}</span>
              <span className="check-label-name">{e.title}</span>
            </span>
          </button>
          {hasDetail && !exitingRow ? (
            <button
              type="button"
              className="cal-expand"
              aria-expanded={expanded}
              aria-label={expanded ? "Hide details" : "Show details"}
              onClick={() =>
                setCalExpanded((prev) => (prev === e.id ? null : e.id))
              }
            >
              {expanded ? "Less" : "More"}
            </button>
          ) : null}
          {exitingRow ? (
            <span className="clear-burst" aria-hidden>
              ✓
            </span>
          ) : null}
        </div>
        {expanded && !exitingRow ? (
          <div className="cal-detail">
            {e.calendarName ? <p>{e.calendarName}</p> : null}
            {e.endTime && !e.allDay ? <p>Until {e.endTime}</p> : null}
            {e.location ? <p>{e.location}</p> : null}
            {e.description ? <p>{e.description}</p> : null}
            {e.recurring ? <p>Repeats</p> : null}
            {e.url ? (
              <p>
                <a href={e.url} target="_blank" rel="noreferrer">
                  Open link
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="panel">
      <div className="row">
        <p className="eyebrow" style={{ marginBottom: 0 }}>
          Today&apos;s Build
        </p>
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          <span className="chip">
            {openCount === 0 ? "Clear for today" : `${openCount} left`}
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Undo today's items"
            aria-expanded={undoOpen}
            onClick={() => setUndoOpen((v) => !v)}
          >
            ⋯
          </button>
        </div>
      </div>

      {undoOpen && (
        <div className="undo-panel">
          <p className="tiny" style={{ marginBottom: 8 }}>
            Bring something back to today&apos;s list
          </p>
          {!hasUndoItems && (
            <p className="muted" style={{ margin: 0 }}>
              Nothing to undo yet.
            </p>
          )}
          {completedSupports.map((s) => (
            <div key={`done-${s.supportType}`} className="undo-row">
              <span>{supportLabel(s.supportType)} · done</span>
              <button
                type="button"
                className="dismiss-btn"
                disabled={undoBusy === s.supportType}
                onClick={() => undoSupport(s.supportType)}
              >
                Undo
              </button>
            </div>
          ))}
          {skippedToday.map((s) => (
            <div key={`skip-${s.itemKey}`} className="undo-row">
              <span>{itemLabel(s.itemKey)} · not today</span>
              <button
                type="button"
                className="dismiss-btn"
                disabled={undoBusy === `skip:${s.itemKey}`}
                onClick={() => undoSkip(s.itemKey)}
              >
                Undo
              </button>
            </div>
          ))}
          {completedProvisions.map((p) => (
            <div key={`prov-done-${p.id}`} className="undo-row">
              <span>{p.label} · done</span>
              <button
                type="button"
                className="dismiss-btn"
                disabled={undoBusy === `prov:${p.id}`}
                onClick={() => undoProvision(p.id)}
              >
                Undo
              </button>
            </div>
          ))}
          {completedCalEvents.map((e) => (
            <div key={`cal-done-${e.id}`} className="undo-row">
              <span>
                {calTimeLabel(e)} · {e.title} · done
              </span>
              <button
                type="button"
                className="dismiss-btn"
                disabled={undoBusy === `cal:${e.id}`}
                onClick={() => undoCalendar(e.id)}
              >
                Undo
              </button>
            </div>
          ))}
          {morningDone && (
            <div className="undo-row">
              <span>Start the day · done</span>
              <button
                type="button"
                className="dismiss-btn"
                disabled={undoBusy === "morning"}
                onClick={() => undoMorning()}
              >
                Undo
              </button>
            </div>
          )}
          {eveningDone && (
            <p className="tiny">Evening check-in is logged for today.</p>
          )}
        </div>
      )}

      <div className="daily-actions" style={{ marginTop: 10 }}>
        {showMorningOpen && (
          <div className="check-item check-item-row">
            <Link href="/morning" className="check-item-main">
              <span className="check-box" />
              <span className="check-label">Start the day</span>
            </Link>
            <button
              type="button"
              className="dismiss-btn"
              disabled={skipBusy === "morning"}
              onClick={() =>
                dismissItem({ key: "morning", label: "Start the day" })
              }
            >
              Not today
            </button>
          </div>
        )}

        {dismissing
          .filter((d) => d.key === "morning")
          .map((d) => (
            <DismissingTaskRow key={d.key} label={d.label} />
          ))}

        {calExitingRows.map((e) => renderCalendarRow(e, true))}
        {openCalEvents.map((e) => renderCalendarRow(e, false))}

        {enabledSupports.map((s) => {
          const weekDone =
            dashboard.week.find((w) => w.type === s.type)?.done ?? 0;
          const weekMeta = ` · ${weekDone}/${s.weeklyTarget}`;
          const dismissingItem = dismissing.find((d) => d.key === s.type);

          if (dismissingItem) {
            return (
              <DismissingTaskRow
                key={s.type}
                label={dismissingItem.label}
                meta={dismissingItem.meta}
              />
            );
          }

          if (skips.has(s.type)) return null;

          const isExiting = exitingTypes.has(s.type);
          const isDone = completedSupportTypes.has(s.type) && !isExiting;
          if (isDone) return null;

          const exitingItem = exiting.find((e) => e.type === s.type);

          if (isExiting && exitingItem) {
            return (
              <div
                key={s.type}
                className="check-item check-item-row clearing"
                aria-live="polite"
              >
                <div className="check-item-main" aria-hidden>
                  <span className="check-box checked">✓</span>
                  <span className="check-label">
                    <span className="check-label-name">
                      {truncateSupportLabel(exitingItem.label)}
                    </span>
                    <span className="check-label-meta">
                      · {exitingItem.weekDone + 1}/{exitingItem.weeklyTarget}
                    </span>
                  </span>
                </div>
                <span className="clear-burst" aria-hidden>
                  +1
                </span>
              </div>
            );
          }

          return (
            <div key={s.type} className="check-item check-item-row">
              <button
                type="button"
                className="check-item-main"
                disabled={busyType === s.type}
                onClick={() =>
                  completeSupport({
                    type: s.type,
                    label: s.label,
                    weekDone,
                    weeklyTarget: s.weeklyTarget,
                  })
                }
              >
                <span className="check-box" />
                <span className="check-label">
                  <span className="check-label-name">
                    {truncateSupportLabel(s.label)}
                  </span>
                  <span className="check-label-meta">
                    · {weekDone}/{s.weeklyTarget}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="dismiss-btn"
                disabled={skipBusy === s.type}
                onClick={() =>
                  dismissItem({
                    key: s.type,
                    label: truncateSupportLabel(s.label),
                    meta: weekMeta,
                  })
                }
              >
                Not today
              </button>
            </div>
          );
        })}

        {openProvisions.map((p) => (
          <div key={p.id} className="check-item check-item-row">
            <button
              type="button"
              className="check-item-main"
              disabled={undoBusy === `prov:${p.id}`}
              onClick={() => completeProvision(p.id)}
            >
              <span className="check-box" />
              <span className="check-label">{p.label}</span>
            </button>
          </div>
        ))}

        {showEveningOpen && (
          <div className="check-item check-item-row">
            <Link href="/evening" className="check-item-main">
              <span className="check-box" />
              <span className="check-label">Close the day</span>
            </Link>
            <button
              type="button"
              className="dismiss-btn"
              disabled={skipBusy === "evening"}
              onClick={() =>
                dismissItem({ key: "evening", label: "Close the day" })
              }
            >
              Not today
            </button>
          </div>
        )}

        {dismissing
          .filter((d) => d.key === "evening")
          .map((d) => (
            <DismissingTaskRow key={d.key} label={d.label} />
          ))}

        {openCount === 0 && (
          <p className="muted" style={{ marginTop: 4 }}>
            Today&apos;s list is clear. Nice work.
          </p>
        )}
      </div>
    </section>
  );
}
