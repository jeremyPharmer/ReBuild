"use client";

import { useState } from "react";
import {
  TodoComposer,
  type TodoComposerPayload,
} from "@/components/TodoComposer";
import { addDays, formatDisplayDate } from "@/lib/journey";
import { formatRecurrence, recurrenceOf } from "@/lib/todos";
import type { DayProvision } from "@/lib/types";

function formatTodoTime(time: string): string {
  const [hRaw, m] = time.split(":");
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return time;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${m ?? "00"} ${suffix}`;
}

function taskMeta(
  item: DayProvision,
  viewDate: string,
  today: string,
): string | null {
  const rec = recurrenceOf(item);
  const parts: string[] = [];
  if (item.time) parts.push(formatTodoTime(item.time));
  const recLabel = formatRecurrence(rec, item.date);
  if (recLabel) parts.push(recLabel);
  if (item.date !== viewDate && !item.completed && !item.lastCompletedOn) {
    parts.push(formatDisplayDate(item.date));
  } else if (item.date !== today && viewDate === today) {
    parts.push(formatDisplayDate(item.date));
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function TodoTaskRow({
  item,
  today,
  viewDate,
  home = false,
  busy,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onUndo,
}: {
  item: DayProvision;
  today: string;
  viewDate?: string;
  home?: boolean;
  busy: boolean;
  onComplete: () => void | Promise<void>;
  onSnooze: (until: "tomorrow" | string) => void | Promise<void>;
  onEdit: (payload: TodoComposerPayload) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onUndo?: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const activeDate = viewDate ?? today;
  const meta = taskMeta(item, activeDate, today);
  const doneToday = Boolean(item.completed || item.lastCompletedOn);
  const canSnooze = activeDate >= today && !doneToday;
  const snoozeLabel =
    activeDate === today ? "Tomorrow" : formatDisplayDate(addDays(activeDate, 1));

  if (home) {
    return (
      <div className="todo-task todo-task-home">
        <div className="tasks-item">
          <button
            type="button"
            className="tasks-check-btn"
            disabled={busy || doneToday}
            aria-label={`Complete ${item.label}`}
            onClick={onComplete}
          >
            <span className={`tasks-check${doneToday ? " tasks-check-done" : ""}`}>
              {doneToday ? "✓" : ""}
            </span>
          </button>
          <button
            type="button"
            className="tasks-main"
            disabled={busy}
            aria-label={`Edit ${item.label}`}
            onClick={() => setEditing(true)}
          >
            <span className="tasks-body">
              <span className="tasks-title">{item.label}</span>
              {meta ? <span className="tasks-meta">{meta}</span> : null}
            </span>
          </button>
          {canSnooze ? (
            <button
              type="button"
              className="tasks-action-btn"
              disabled={busy}
              onClick={() => void onSnooze(addDays(activeDate, 1))}
            >
              {snoozeLabel}
            </button>
          ) : null}
        </div>
        {editing && (
          <TodoComposer
            today={today}
            initial={item}
            busy={busy}
            submitLabel="Save"
            onDelete={() => {
              void onDelete();
              setEditing(false);
            }}
            onSubmit={async (payload) => {
              await onEdit(payload);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="todo-task">
      <div className="check-item check-item-row">
        <button
          type="button"
          className="check-box-btn"
          disabled={busy || doneToday}
          aria-label={`Complete ${item.label}`}
          onClick={onComplete}
        >
          <span className={`check-box${doneToday ? " checked" : ""}`}>
            {doneToday ? "✓" : ""}
          </span>
        </button>
        <button
          type="button"
          className="check-item-body"
          disabled={busy}
          aria-label={`Edit ${item.label}`}
          onClick={() => setEditing(true)}
        >
          <span className="check-label-stacked">
            <span className="check-label-name">{item.label}</span>
            {meta ? <span className="check-label-meta">{meta}</span> : null}
          </span>
        </button>
        {!doneToday && (
          <button
            type="button"
            className="dismiss-btn"
            disabled={busy}
            onClick={() => void onSnooze(addDays(activeDate, 1))}
          >
            {snoozeLabel}
          </button>
        )}
        {doneToday && onUndo && (
          <button
            type="button"
            className="dismiss-btn"
            disabled={busy}
            onClick={() => void onUndo()}
          >
            Undo
          </button>
        )}
      </div>
      {editing && (
        <TodoComposer
          today={today}
          initial={item}
          busy={busy}
          submitLabel="Save"
          onDelete={() => {
            void onDelete();
            setEditing(false);
          }}
          onSubmit={async (payload) => {
            await onEdit(payload);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
