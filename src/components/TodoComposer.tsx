"use client";

import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { addDays, parseDate } from "@/lib/journey";
import { WEEKDAY_LABELS, firstDueDate, recurrenceOf } from "@/lib/todos";
import type { DayProvision, TodoRecurrence } from "@/lib/types";

export type TodoComposerPayload = {
  label: string;
  date: string;
  recurrence: TodoRecurrence;
};

type Kind = TodoRecurrence["kind"];

const KINDS: { kind: Kind; label: string }[] = [
  { kind: "none", label: "Doesn’t repeat" },
  { kind: "daily", label: "Daily" },
  { kind: "weekly", label: "Weekly" },
  { kind: "every_n_days", label: "Every N days" },
  { kind: "monthly_first", label: "1st of the month" },
];

function recurrenceFromForm(
  kind: Kind,
  weekdays: number[],
  everyN: number,
): TodoRecurrence {
  if (kind === "daily") return { kind: "daily" };
  if (kind === "monthly_first") return { kind: "monthly_first" };
  if (kind === "every_n_days") return { kind: "every_n_days", n: everyN };
  if (kind === "weekly") return { kind: "weekly", weekdays };
  return { kind: "none" };
}

export function TodoComposer({
  today,
  initial,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  today: string;
  initial?: DayProvision | null;
  busy: boolean;
  submitLabel?: string;
  onSubmit: (payload: TodoComposerPayload) => void | Promise<void>;
  onCancel: () => void;
}) {
  const initialRec = initial ? recurrenceOf(initial) : { kind: "none" as const };
  const [label, setLabel] = useState(initial?.label ?? "");
  const [date, setDate] = useState(initial?.date ?? today);
  const [kind, setKind] = useState<Kind>(initialRec.kind);
  const [weekdays, setWeekdays] = useState<number[]>(
    initialRec.kind === "weekly"
      ? initialRec.weekdays
      : [parseDate(today).getDay()],
  );
  const [everyN, setEveryN] = useState(
    initialRec.kind === "every_n_days" ? initialRec.n : 3,
  );
  const [error, setError] = useState("");

  function toggleWeekday(d: number) {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  async function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (kind === "weekly" && weekdays.length === 0) {
      setError("Pick at least one weekday");
      return;
    }
    const recurrence = recurrenceFromForm(kind, weekdays, everyN);
    const due =
      date ||
      (initial ? initial.date : firstDueDate(today, recurrence));
    setError("");
    await onSubmit({ label: trimmed, date: due, recurrence });
  }

  return (
    <div className="todo-composer fade-in">
      <label className="field" style={{ marginBottom: 8 }}>
        <span className="field-label">Item</span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="What needs doing?"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
        />
      </label>
      <label className="field" style={{ marginBottom: 8 }}>
        <span className="field-label">Due</span>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="field" style={{ marginBottom: 8 }}>
        <span className="field-label">Repeat</span>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
        >
          {KINDS.map((k) => (
            <option key={k.kind} value={k.kind}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      {kind === "weekly" && (
        <div className="todo-weekdays" role="group" aria-label="Weekdays">
          {WEEKDAY_LABELS.map((name, d) => (
            <button
              key={name}
              type="button"
              className={
                weekdays.includes(d) ? "todo-day-chip selected" : "todo-day-chip"
              }
              onClick={() => toggleWeekday(d)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {kind === "every_n_days" && (
        <label className="field" style={{ marginBottom: 8 }}>
          <span className="field-label">Every</span>
          <input
            type="number"
            min={1}
            max={365}
            value={everyN}
            onChange={(e) => setEveryN(Math.max(1, Number(e.target.value) || 1))}
          />
          <span className="tiny">days</span>
        </label>
      )}
      {error && (
        <p className="tiny" style={{ color: "var(--danger)", margin: 0 }}>
          {error}
        </p>
      )}
      <div className="todo-composer-actions">
        <SecondaryButton onClick={onCancel} disabled={busy}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={() => void submit()}
          disabled={busy || !label.trim()}
        >
          {busy ? "Saving…" : (submitLabel ?? (initial ? "Save" : "Add"))}
        </PrimaryButton>
      </div>
    </div>
  );
}

export function SnoozeUntilPicker({
  today,
  busy,
  onPick,
  onCancel,
}: {
  today: string;
  busy: boolean;
  onPick: (until: string) => void;
  onCancel: () => void;
}) {
  const tomorrow = addDays(today, 1);
  const [until, setUntil] = useState(tomorrow);
  return (
    <div className="todo-snooze-until fade-in">
      <label className="field" style={{ marginBottom: 8 }}>
        <span className="field-label">Snooze until</span>
        <input
          type="date"
          value={until}
          min={tomorrow}
          onChange={(e) => setUntil(e.target.value)}
        />
      </label>
      <div className="todo-composer-actions">
        <SecondaryButton onClick={onCancel} disabled={busy}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={() => onPick(until)}
          disabled={busy || until <= today}
        >
          Snooze
        </PrimaryButton>
      </div>
    </div>
  );
}
