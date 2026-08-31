"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { TodoComposer, type TodoComposerPayload } from "@/components/TodoComposer";
import { TodoTaskRow } from "@/components/TodoTaskRow";
import { truncateSupportLabel } from "@/lib/auth-constants";
import {
  completedTodosForUndo,
  openTodosOn,
} from "@/lib/todos";
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
  const [adding, setAdding] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [todoBusyId, setTodoBusyId] = useState<string | null>(null);

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
  const todos = state.dayProvisions ?? [];
  const openTodos = openTodosOn(todos, today);
  const undoTodos = completedTodosForUndo(todos, today);
  const morningSkipped = skips.has("morning");
  const eveningSkipped = skips.has("evening");
  const morningDone = Boolean(dashboard.todayMorning);
  const eveningDone = Boolean(dashboard.todayEvening);
  const showMorningOpen =
    !morningDone && !morningSkipped && !dismissingKeys.has("morning");
  const showEveningOpen =
    !eveningDone && !eveningSkipped && !dismissingKeys.has("evening");
  const openCount =
    (showMorningOpen ? 1 : 0) +
    openSupports.length +
    openTodos.length +
    exiting.length +
    dismissing.length +
    (showEveningOpen ? 1 : 0);

  const completedSupports = dashboard.todaySupports;
  const skippedToday = (state.skips ?? []).filter((s) => s.date === today);
  const hasUndoItems =
    completedSupports.length > 0 ||
    undoTodos.length > 0 ||
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

  async function todoAction(
    id: string,
    body: Record<string, unknown>,
  ) {
    setTodoBusyId(id);
    try {
      await post("/api/todos", body);
    } finally {
      setTodoBusyId(null);
    }
  }

  async function addTodo(payload: TodoComposerPayload) {
    setAddBusy(true);
    try {
      await post("/api/todos", {
        action: "add",
        label: payload.label,
        date: payload.date,
        recurrence: payload.recurrence,
      });
      setAdding(false);
    } finally {
      setAddBusy(false);
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

  return (
    <section className="panel">
      <div className="row">
        <p className="eyebrow" style={{ marginBottom: 0 }}>
          Today&apos;s Items
        </p>
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          {!adding && (
            <button
              type="button"
              className="icon-btn"
              aria-label="Add an item"
              onClick={() => setAdding(true)}
            >
              +
            </button>
          )}
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
          {undoTodos.map((p) => (
            <div key={`todo-done-${p.id}`} className="undo-row">
              <span>{p.label} · done</span>
              <button
                type="button"
                className="dismiss-btn"
                disabled={undoBusy === `todo:${p.id}`}
                onClick={async () => {
                  setUndoBusy(`todo:${p.id}`);
                  try {
                    await post("/api/todos", { action: "undo", id: p.id });
                  } finally {
                    setUndoBusy(null);
                  }
                }}
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
        {adding && (
          <TodoComposer
            today={today}
            busy={addBusy}
            onSubmit={addTodo}
            onCancel={() => setAdding(false)}
          />
        )}

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

        {openTodos.map((p) => (
          <TodoTaskRow
            key={p.id}
            item={p}
            today={today}
            busy={todoBusyId === p.id}
            onComplete={() =>
              todoAction(p.id, { action: "complete", id: p.id })
            }
            onSnooze={(until) =>
              todoAction(p.id, { action: "snooze", id: p.id, until })
            }
            onEdit={(payload) =>
              todoAction(p.id, {
                action: "edit",
                id: p.id,
                ...payload,
              })
            }
            onDelete={() => todoAction(p.id, { action: "delete", id: p.id })}
          />
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

        {openCount === 0 && !adding && (
          <p className="muted" style={{ marginTop: 4 }}>
            Today&apos;s list is clear. Nice work.
          </p>
        )}
      </div>

      <Link href="/items" className="btn ghost workout-open-link">
        Open tasks →
      </Link>
    </section>
  );
}
