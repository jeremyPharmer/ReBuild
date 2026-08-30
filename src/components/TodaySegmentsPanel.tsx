"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { truncateSupportLabel } from "@/lib/auth-constants";
import type { SupportType } from "@/lib/types";
import type { WorkCalendarEvent } from "@/lib/work-calendar";

type SkipKey = SupportType | "morning" | "evening";
type Segment = "work" | "re" | "life";

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

const RE_SUPPORTS = new Set(["recovery_content", "meditation", "medication"]);

function supportSegment(type: string): Segment {
  if (RE_SUPPORTS.has(type)) return "re";
  if (type === "gym") return "life";
  return "life";
}

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

function SegmentBlock({
  title,
  openCount,
  children,
}: {
  title: string;
  openCount: number;
  children: React.ReactNode;
}) {
  return (
    <section className="segment-panel">
      <div className="segment-head">
        <h3>{title}</h3>
        <span className="chip">{openCount === 0 ? "Clear" : `${openCount} open`}</span>
      </div>
      <div className="daily-actions">{children}</div>
    </section>
  );
}

function WorkEventRow({ event }: { event: WorkCalendarEvent }) {
  return (
    <div className="check-item check-item-row work-event-row">
      <div className="check-item-main work-event-main">
        <span className="work-event-time">{event.startTime}</span>
        <span className="check-label">
          <span className="check-label-name">{event.title}</span>
          {event.location ? (
            <span className="check-label-meta"> · {event.location}</span>
          ) : null}
        </span>
      </div>
      {event.url ? (
        <a
          className="btn ghost"
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join
        </a>
      ) : null}
    </div>
  );
}

export function TodaySegmentsPanel() {
  const { state, dashboard, today, post } = useApp();
  const [busyType, setBusyType] = useState<SupportType | null>(null);
  const [skipBusy, setSkipBusy] = useState<SkipKey | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoBusy, setUndoBusy] = useState<string | null>(null);
  const [exiting, setExiting] = useState<ExitingSupport[]>([]);
  const [dismissing, setDismissing] = useState<DismissingItem[]>([]);
  const [workEvents, setWorkEvents] = useState<WorkCalendarEvent[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/calendar/work?date=${encodeURIComponent(today)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setWorkEvents(data.events ?? []);
        setCalendarConnected(Boolean(data.connected));
      })
      .catch(() => {
        if (!cancelled) setWorkEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [today]);

  if (!dashboard) return null;

  const dash = dashboard;

  const skips = new Set(dash.todaySkips ?? []);
  const enabledSupports = state.profile!.supports.filter((s) => s.enabled);
  const completedSupportTypes = new Set(
    dash.todaySupports.map((t) => t.supportType),
  );
  const exitingTypes = new Set(exiting.map((e) => e.type));
  const dismissingKeys = new Set(dismissing.map((d) => d.key));

  const reSupports = enabledSupports.filter(
    (s) => supportSegment(s.type) === "re",
  );
  const lifeSupports = enabledSupports.filter(
    (s) => supportSegment(s.type) === "life" && s.type !== "gym",
  );

  const openReSupports = reSupports.filter(
    (s) =>
      !skips.has(s.type) &&
      !completedSupportTypes.has(s.type) &&
      !exitingTypes.has(s.type) &&
      !dismissingKeys.has(s.type),
  );
  const openLifeSupports = lifeSupports.filter(
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
  const morningDone = Boolean(dash.todayMorning);
  const eveningDone = Boolean(dash.todayEvening);
  const showMorningOpen =
    !morningDone && !morningSkipped && !dismissingKeys.has("morning");
  const showEveningOpen =
    !eveningDone && !eveningSkipped && !dismissingKeys.has("evening");

  const workOpen = workEvents.length;
  const reOpen =
    (showMorningOpen ? 1 : 0) +
    openReSupports.length +
    exiting.filter((e) => supportSegment(e.type) === "re").length +
    dismissing.filter((d) => {
      if (d.key === "morning" || d.key === "evening") return d.key === "morning";
      return supportSegment(d.key) === "re";
    }).length +
    (showEveningOpen ? 1 : 0);
  const lifeOpen =
    openLifeSupports.length +
    openProvisions.length +
    exiting.filter((e) => supportSegment(e.type) === "life" && e.type !== "gym")
      .length +
    dismissing.filter((d) => {
      if (d.key === "morning" || d.key === "evening") return false;
      return supportSegment(d.key) === "life" && d.key !== "gym";
    }).length;

  const completedSupports = dash.todaySupports;
  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems =
    completedSupports.length > 0 ||
    completedProvisions.length > 0 ||
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

  function renderSupportRow(s: (typeof enabledSupports)[0]) {
    const weekDone = dash.week.find((w) => w.type === s.type)?.done ?? 0;
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
  }

  return (
    <section className="panel home-segments">
      <div className="row">
        <p className="eyebrow" style={{ marginBottom: 0 }}>
          Today
        </p>
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
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

      <div className="segment-stack">
        <SegmentBlock title="Work" openCount={workOpen}>
          {workEvents.map((event) => (
            <WorkEventRow key={event.id} event={event} />
          ))}
          {workEvents.length === 0 && (
            <p className="muted segment-empty">
              {calendarConnected
                ? "No meetings on the calendar today."
                : "Work calendar not connected — events will show here when synced."}
            </p>
          )}
        </SegmentBlock>

        <SegmentBlock title="RE" openCount={reOpen}>
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
          {reSupports.map((s) => renderSupportRow(s))}
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
          {reOpen === 0 && (
            <p className="muted segment-empty">RE list is clear.</p>
          )}
        </SegmentBlock>

        <SegmentBlock title="Life" openCount={lifeOpen}>
          {lifeSupports.map((s) => renderSupportRow(s))}
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
          {lifeOpen === 0 && (
            <p className="muted segment-empty">Life list is clear.</p>
          )}
        </SegmentBlock>
      </div>
    </section>
  );
}
