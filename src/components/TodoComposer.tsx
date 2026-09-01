"use client";

import { useMemo, useState } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  Sheet,
} from "@/components/ui";
import { addDays, parseDate } from "@/lib/journey";
import {
  WEEKDAY_LABELS,
  WEEKDAY_LETTERS,
  firstDueDate,
  recurrenceOf,
} from "@/lib/todos";
import type { DayProvision, TodoRecurrence } from "@/lib/types";

export type TodoComposerPayload = {
  label: string;
  date: string;
  time?: string;
  recurrence: TodoRecurrence;
};

/** Google Tasks–style repeat presets (Custom opens full controls). */
type RepeatPreset =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

type EndsMode = "never" | "on" | "after";
type Frequency = "day" | "week" | "month" | "year";

const PRESETS: { id: RepeatPreset; label: string }[] = [
  { id: "none", label: "Does not repeat" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "custom", label: "Custom…" },
];

const FREQ_UNITS: { id: Frequency; singular: string; plural: string }[] = [
  { id: "day", singular: "day", plural: "days" },
  { id: "week", singular: "week", plural: "weeks" },
  { id: "month", singular: "month", plural: "months" },
  { id: "year", singular: "year", plural: "years" },
];

function presetFromRecurrence(rec: TodoRecurrence): RepeatPreset {
  if (rec.kind === "none") return "none";
  if (rec.kind === "daily") return "daily";
  if (rec.kind === "weekly") return "weekly";
  if (rec.kind === "monthly_first") return "custom";
  if (rec.kind === "every_n_days") {
    return rec.n === 1 ? "daily" : "custom";
  }
  if (rec.kind === "repeat") {
    if (rec.interval === 1 && (!rec.ends || rec.ends.type === "never")) {
      if (rec.frequency === "day") return "daily";
      if (rec.frequency === "week") return "weekly";
      if (rec.frequency === "month" && rec.monthlyOn !== "nth_weekday") {
        return "monthly";
      }
      if (rec.frequency === "year") return "yearly";
    }
    return "custom";
  }
  return "none";
}

function buildRecurrence(
  preset: RepeatPreset,
  dueDate: string,
  weekdays: number[],
  frequency: Frequency,
  interval: number,
  monthlyOn: "day" | "nth_weekday",
  endsMode: EndsMode,
  endsDate: string,
  endsCount: number,
): TodoRecurrence {
  const ends =
    endsMode === "on"
      ? ({ type: "on", date: endsDate } as const)
      : endsMode === "after"
        ? ({ type: "after", count: endsCount } as const)
        : ({ type: "never" } as const);

  if (preset === "none") return { kind: "none" };

  if (preset === "daily") {
    return { kind: "repeat", frequency: "day", interval: 1, ends: { type: "never" } };
  }
  if (preset === "weekly") {
    const day = weekdays.length > 0 ? weekdays : [parseDate(dueDate).getDay()];
    return {
      kind: "repeat",
      frequency: "week",
      interval: 1,
      weekdays: day,
      ends: { type: "never" },
    };
  }
  if (preset === "monthly") {
    return {
      kind: "repeat",
      frequency: "month",
      interval: 1,
      monthlyOn: "day",
      ends: { type: "never" },
    };
  }
  if (preset === "yearly") {
    return {
      kind: "repeat",
      frequency: "year",
      interval: 1,
      ends: { type: "never" },
    };
  }

  if (frequency === "week") {
    return {
      kind: "repeat",
      frequency: "week",
      interval,
      weekdays: weekdays.length > 0 ? weekdays : [parseDate(dueDate).getDay()],
      ends,
    };
  }
  if (frequency === "month") {
    return {
      kind: "repeat",
      frequency: "month",
      interval,
      monthlyOn,
      ends,
    };
  }
  return { kind: "repeat", frequency, interval, ends };
}

function WeekdayPicker({
  weekdays,
  onToggle,
  compact,
}: {
  weekdays: number[];
  onToggle: (d: number) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={compact ? "todo-repeat-on-days" : "todo-weekdays"}
      role="group"
      aria-label="Repeat on"
    >
      {(compact ? WEEKDAY_LETTERS : WEEKDAY_LABELS).map((name, d) => (
        <button
          key={`${name}-${d}`}
          type="button"
          className={
            weekdays.includes(d)
              ? compact
                ? "todo-repeat-day selected"
                : "todo-day-chip selected"
              : compact
                ? "todo-repeat-day"
                : "todo-day-chip"
          }
          onClick={() => onToggle(d)}
          aria-pressed={weekdays.includes(d)}
          aria-label={WEEKDAY_LABELS[d]}
        >
          {name}
        </button>
      ))}
    </div>
  );
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
  const [time, setTime] = useState(initial?.time ?? "");
  const [hasTime, setHasTime] = useState(Boolean(initial?.time));
  const [preset, setPreset] = useState<RepeatPreset>(() =>
    presetFromRecurrence(initialRec),
  );
  const [weekdays, setWeekdays] = useState<number[]>(() => {
    if (initialRec.kind === "weekly") return initialRec.weekdays;
    if (initialRec.kind === "repeat" && initialRec.weekdays?.length) {
      return initialRec.weekdays;
    }
    return [parseDate(initial?.date ?? today).getDay()];
  });
  const [frequency, setFrequency] = useState<Frequency>(() => {
    if (initialRec.kind === "repeat") return initialRec.frequency;
    if (initialRec.kind === "every_n_days") return "day";
    if (initialRec.kind === "monthly_first") return "month";
    if (initialRec.kind === "weekly") return "week";
    return "week";
  });
  const [interval, setIntervalN] = useState(() => {
    if (initialRec.kind === "repeat") return initialRec.interval;
    if (initialRec.kind === "every_n_days") return initialRec.n;
    return 1;
  });
  const [monthlyOn, setMonthlyOn] = useState<"day" | "nth_weekday">(() =>
    initialRec.kind === "repeat" && initialRec.monthlyOn === "nth_weekday"
      ? "nth_weekday"
      : "day",
  );
  const [endsMode, setEndsMode] = useState<EndsMode>(() => {
    if (initialRec.kind === "repeat" && initialRec.ends) {
      if (initialRec.ends.type === "on") return "on";
      if (initialRec.ends.type === "after") return "after";
    }
    return "never";
  });
  const [endsDate, setEndsDate] = useState(() =>
    initialRec.kind === "repeat" && initialRec.ends?.type === "on"
      ? initialRec.ends.date
      : today,
  );
  const [endsCount, setEndsCount] = useState(() =>
    initialRec.kind === "repeat" && initialRec.ends?.type === "after"
      ? initialRec.ends.count
      : 13,
  );
  const [error, setError] = useState("");

  const showPresetWeekdays = preset === "weekly";
  const showCustom = preset === "custom";
  const unitLabel =
    FREQ_UNITS.find((u) => u.id === frequency)?.[
      interval === 1 ? "singular" : "plural"
    ] ?? "week";

  const title = useMemo(
    () => (initial ? "Edit task" : "New task"),
    [initial],
  );

  function toggleWeekday(d: number) {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  function handlePresetChange(next: RepeatPreset) {
    setPreset(next);
    if (next === "custom" && frequency === "week" && weekdays.length === 0) {
      setWeekdays([parseDate(date || today).getDay()]);
    }
  }

  async function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;
    const needsWeekdays =
      preset === "weekly" || (preset === "custom" && frequency === "week");
    if (needsWeekdays && weekdays.length === 0) {
      setError("Pick at least one weekday");
      return;
    }
    if (showCustom && endsMode === "on" && endsDate < date) {
      setError("End date must be on or after the due date");
      return;
    }
    const recurrence = buildRecurrence(
      preset,
      date || today,
      weekdays,
      frequency,
      Math.max(1, interval),
      monthlyOn,
      endsMode,
      endsDate,
      Math.max(1, endsCount),
    );
    const due =
      date ||
      (initial ? initial.date : firstDueDate(today, recurrence));
    setError("");
    await onSubmit({
      label: trimmed,
      date: due,
      time: hasTime && time ? time : undefined,
      recurrence,
    });
  }

  return (
    <Sheet label={title} busy={busy} onClose={onCancel}>
      <div className="todo-composer-sheet fade-in">
        <p className="eyebrow">{title}</p>

        <label className="field">
          <span className="field-label">Task</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What needs doing?"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          />
        </label>

        <div className="todo-composer-datetime">
          <label className="field">
            <span className="field-label">Date</span>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <div className="field">
            <span className="field-label">Time</span>
            {hasTime ? (
              <div className="todo-time-row">
                <input
                  type="time"
                  value={time || "09:00"}
                  onChange={(e) => setTime(e.target.value)}
                />
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setHasTime(false);
                    setTime("");
                  }}
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="todo-time-add"
                onClick={() => {
                  setHasTime(true);
                  setTime("09:00");
                }}
              >
                Add time
              </button>
            )}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Repeat</span>
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value as RepeatPreset)}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        {showCustom && (
          <div className="todo-custom-repeat">
            <p className="todo-custom-title">Custom recurrence</p>

            <div className="todo-repeat-row">
              <span className="todo-repeat-label">Repeat every</span>
              <div className="todo-interval-row">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={interval}
                  onChange={(e) =>
                    setIntervalN(Math.max(1, Number(e.target.value) || 1))
                  }
                  aria-label="Repeat interval"
                />
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  aria-label="Repeat unit"
                >
                  {FREQ_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {interval === 1 ? u.singular : u.plural}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {frequency === "week" && (
              <div className="todo-repeat-row">
                <span className="todo-repeat-label">Repeat on</span>
                <WeekdayPicker
                  weekdays={weekdays}
                  onToggle={toggleWeekday}
                  compact
                />
              </div>
            )}

            {frequency === "month" && (
              <label className="field">
                <span className="field-label">Monthly on</span>
                <select
                  value={monthlyOn}
                  onChange={(e) =>
                    setMonthlyOn(e.target.value as "day" | "nth_weekday")
                  }
                >
                  <option value="day">Same date each month</option>
                  <option value="nth_weekday">Same weekday each month</option>
                </select>
              </label>
            )}

            <div className="todo-repeat-row todo-ends-block">
              <span className="todo-repeat-label">Ends</span>
              <div className="todo-ends-options" role="radiogroup" aria-label="Ends">
                <label className="todo-ends-option">
                  <input
                    type="radio"
                    name="todo-ends"
                    checked={endsMode === "never"}
                    onChange={() => setEndsMode("never")}
                  />
                  <span>Never</span>
                </label>
                <label className="todo-ends-option">
                  <input
                    type="radio"
                    name="todo-ends"
                    checked={endsMode === "on"}
                    onChange={() => setEndsMode("on")}
                  />
                  <span>On</span>
                  <input
                    type="date"
                    className="todo-ends-inline-date"
                    value={endsDate}
                    min={date || today}
                    disabled={endsMode !== "on"}
                    onChange={(e) => setEndsDate(e.target.value)}
                    aria-label="End date"
                  />
                </label>
                <label className="todo-ends-option">
                  <input
                    type="radio"
                    name="todo-ends"
                    checked={endsMode === "after"}
                    onChange={() => setEndsMode("after")}
                  />
                  <span>After</span>
                  <input
                    type="number"
                    className="todo-ends-inline-count"
                    min={1}
                    max={999}
                    value={endsCount}
                    disabled={endsMode !== "after"}
                    onChange={(e) =>
                      setEndsCount(Math.max(1, Number(e.target.value) || 1))
                    }
                    aria-label="Occurrences"
                  />
                  <span className="todo-ends-suffix">occurrences</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {showPresetWeekdays && (
          <div className="field">
            <span className="field-label">Repeat on</span>
            <WeekdayPicker weekdays={weekdays} onToggle={toggleWeekday} />
          </div>
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
    </Sheet>
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
