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

function taskMeta(item: DayProvision, today: string): string | null {
  const rec = recurrenceOf(item);
  const parts: string[] = [];
  if (item.time) parts.push(formatTodoTime(item.time));
  const recLabel = formatRecurrence(rec, item.date);
  if (recLabel) parts.push(recLabel);
  if (item.date !== today && !item.completed && !item.lastCompletedOn) {
    parts.push(formatDisplayDate(item.date));
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function TodoTaskRow({
  item,
  today,
  busy,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onUndo,
}: {
  item: DayProvision;
  today: string;
  busy: boolean;
  onComplete: () => void | Promise<void>;
  onSnooze: (until: "tomorrow" | string) => void | Promise<void>;
  onEdit: (payload: TodoComposerPayload) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onUndo?: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const meta = taskMeta(item, today);
  const doneToday = Boolean(item.completed || item.lastCompletedOn);

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
            onClick={() => void onSnooze(addDays(today, 1))}
          >
            Tomorrow
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
