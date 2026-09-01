"use client";

import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { CUSTOM_AGENDA_TITLE_MAX } from "@/lib/custom-agenda-shared";

export type AgendaEventPayload = {
  title: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
};

export function AgendaEventComposer({
  busy,
  onSubmit,
  onCancel,
}: {
  busy: boolean;
  onSubmit: (payload: AgendaEventPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await onSubmit({
      title: trimmed,
      allDay,
      startTime: allDay ? undefined : startTime || undefined,
      endTime: allDay ? undefined : endTime || undefined,
    });
    setTitle("");
    setAllDay(false);
    setStartTime("");
    setEndTime("");
  }

  return (
    <form className="agenda-add-form" onSubmit={(e) => void handleSubmit(e)}>
      <label className="field">
        <span className="field-label">What</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reminder or event"
          maxLength={CUSTOM_AGENDA_TITLE_MAX}
          autoFocus
        />
      </label>
      <label className="check-inline agenda-add-allday">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
        />
        All day
      </label>
      {!allDay && (
        <div className="agenda-add-times">
          <label className="field">
            <span className="field-label">Start</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">End</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
        </div>
      )}
      <div className="agenda-add-actions">
        <PrimaryButton type="submit" disabled={busy || !title.trim()}>
          {busy ? "Adding…" : "Add"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </SecondaryButton>
      </div>
    </form>
  );
}
