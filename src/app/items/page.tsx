"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { TodoComposer, type TodoComposerPayload } from "@/components/TodoComposer";
import { TodoTaskRow } from "@/components/TodoTaskRow";
import {
  doneOneOffTodos,
  openTodosOn,
  upcomingTodos,
} from "@/lib/todos";

export default function ItemsPage() {
  const { state, today, post } = useApp();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!state.profile?.onboarded) router.replace("/onboarding");
  }, [state.profile, router]);

  const todos = state.dayProvisions ?? [];
  const todayOpen = useMemo(() => openTodosOn(todos, today), [todos, today]);
  const upcoming = useMemo(() => upcomingTodos(todos, today), [todos, today]);
  const done = useMemo(() => doneOneOffTodos(todos), [todos]);

  async function run(id: string | null, body: Record<string, unknown>) {
    if (id) setBusyId(id);
    else setAddBusy(true);
    try {
      await post("/api/todos", body);
      if (!id) setAdding(false);
    } finally {
      setBusyId(null);
      setAddBusy(false);
    }
  }

  async function add(payload: TodoComposerPayload) {
    await run(null, {
      action: "add",
      label: payload.label,
      date: payload.date,
      recurrence: payload.recurrence,
    });
  }

  if (!state.profile?.onboarded || !today) return null;

  return (
    <main className="stack fade-in">
      <p className="eyebrow">Tasks</p>
      <h1>Tasks</h1>
      <p className="muted">
        Master list — today, upcoming, and finished.
      </p>

      {adding ? (
        <section className="panel">
          <TodoComposer
            today={today}
            busy={addBusy}
            onSubmit={add}
            onCancel={() => setAdding(false)}
          />
        </section>
      ) : (
        <button
          type="button"
          className="todo-add-toggle"
          onClick={() => setAdding(true)}
        >
          <span>Add an item</span>
          <span className="morning-add-plus" aria-hidden>
            +
          </span>
        </button>
      )}

      <section className="panel">
        <p className="eyebrow">Today</p>
        {todayOpen.length === 0 && (
          <p className="muted" style={{ margin: 0 }}>
            Nothing due today.
          </p>
        )}
        <div className="daily-actions">
          {todayOpen.map((item) => (
            <TodoTaskRow
              key={item.id}
              item={item}
              today={today}
              busy={busyId === item.id}
              onComplete={() =>
                run(item.id, { action: "complete", id: item.id })
              }
              onSnooze={(until) =>
                run(item.id, { action: "snooze", id: item.id, until })
              }
              onEdit={(payload) =>
                run(item.id, { action: "edit", id: item.id, ...payload })
              }
              onDelete={() =>
                run(item.id, { action: "delete", id: item.id })
              }
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Upcoming</p>
        {upcoming.length === 0 && (
          <p className="muted" style={{ margin: 0 }}>
            Nothing snoozed or scheduled ahead.
          </p>
        )}
        <div className="daily-actions">
          {upcoming.map((item) => (
            <TodoTaskRow
              key={item.id}
              item={item}
              today={today}
              busy={busyId === item.id}
              onComplete={() =>
                run(item.id, { action: "complete", id: item.id })
              }
              onSnooze={(until) =>
                run(item.id, { action: "snooze", id: item.id, until })
              }
              onEdit={(payload) =>
                run(item.id, { action: "edit", id: item.id, ...payload })
              }
              onDelete={() =>
                run(item.id, { action: "delete", id: item.id })
              }
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Done</p>
        {done.length === 0 && (
          <p className="muted" style={{ margin: 0 }}>
            Finished one-off items land here.
          </p>
        )}
        <div className="daily-actions">
          {done.map((item) => (
            <TodoTaskRow
              key={item.id}
              item={item}
              today={today}
              busy={busyId === item.id}
              onComplete={() => undefined}
              onSnooze={() => undefined}
              onEdit={(payload) =>
                void run(item.id, { action: "edit", id: item.id, ...payload })
              }
              onDelete={() =>
                run(item.id, { action: "delete", id: item.id })
              }
              onUndo={() =>
                run(item.id, { action: "undo", id: item.id })
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}
