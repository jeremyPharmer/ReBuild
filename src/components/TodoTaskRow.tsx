"use client";

import { useState } from "react";
import {
  SnoozeUntilPicker,
  TodoComposer,
  type TodoComposerPayload,
} from "@/components/TodoComposer";
import { formatDisplayDate } from "@/lib/journey";
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

type Menu = "closed" | "open" | "until" | "edit";

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
  const [menu, setMenu] = useState<Menu>("closed");
  const rec = recurrenceOf(item);
  const recLabel = formatRecurrence(rec);
  const timeLabel = item.time
    ? ` · ${formatTodoTime(item.time)}`
    : "";
  const dueMeta =
    item.date !== today && !item.completed
      ? ` · ${formatDisplayDate(item.date)}`
      : "";

  return (
    <div className="todo-task">
      <div className="check-item check-item-row">
        <button
          type="button"
          className="check-item-main"
          disabled={busy || item.completed}
          onClick={onComplete}
        >
          <span className={`check-box${item.completed ? " checked" : ""}`}>
            {item.completed ? "✓" : ""}
          </span>
          <span className="check-label">
            <span className="check-label-name">{item.label}</span>
            {recLabel || dueMeta || timeLabel ? (
              <span className="check-label-meta">
                {timeLabel}
                {recLabel ? ` · ${recLabel}` : ""}
                {dueMeta}
              </span>
            ) : null}
          </span>
        </button>
        <button
          type="button"
          className="icon-btn todo-more-btn"
          aria-label={`More for ${item.label}`}
          aria-expanded={menu !== "closed"}
          disabled={busy}
          onClick={() => setMenu((m) => (m === "closed" ? "open" : "closed"))}
        >
          ⋯
        </button>
      </div>
      {menu === "open" && (
        <div className="todo-item-menu">
          {item.completed && onUndo && (
            <button
              type="button"
              className="dismiss-btn"
              onClick={() => {
                void onUndo();
                setMenu("closed");
              }}
            >
              Undo
            </button>
          )}
          {!item.completed && (
            <>
              <button
                type="button"
                className="dismiss-btn"
                onClick={() => {
                  void onSnooze("tomorrow");
                  setMenu("closed");
                }}
              >
                Tomorrow
              </button>
              <button
                type="button"
                className="dismiss-btn"
                onClick={() => setMenu("until")}
              >
                Until…
              </button>
            </>
          )}
          <button
            type="button"
            className="dismiss-btn"
            onClick={() => setMenu("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className="dismiss-btn"
            onClick={() => {
              void onDelete();
              setMenu("closed");
            }}
          >
            Delete
          </button>
        </div>
      )}
      {menu === "until" && (
        <SnoozeUntilPicker
          today={today}
          busy={busy}
          onPick={(until) => {
            void onSnooze(until);
            setMenu("closed");
          }}
          onCancel={() => setMenu("closed")}
        />
      )}
      {menu === "edit" && (
        <TodoComposer
          today={today}
          initial={item}
          busy={busy}
          submitLabel="Save"
          onSubmit={async (payload) => {
            await onEdit(payload);
            setMenu("closed");
          }}
          onCancel={() => setMenu("closed")}
        />
      )}
    </div>
  );
}
