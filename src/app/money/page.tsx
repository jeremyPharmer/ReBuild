"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import {
  Money,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import {
  formatDisplayDate,
  waitingReclaimDays,
} from "@/lib/journey";
import type { Reward, RewardCategory } from "@/lib/types";

const CATEGORIES: RewardCategory[] = [
  "clothing",
  "wellness",
  "experiences",
  "growth",
  "travel",
  "food",
  "entertainment",
  "other",
];

type Draft = {
  name: string;
  cost: string;
  category: RewardCategory;
  url: string;
  assignDay: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  cost: "",
  category: "wellness",
  url: "",
  assignDay: "",
});

export default function MoneyPage() {
  const { state, post } = useApp();
  const waiting = waitingReclaimDays(state);
  const [selected, setSelected] = useState<string[]>(() =>
    waiting.map((d) => d.date),
  );
  const estimated = useMemo(
    () =>
      waiting
        .filter((d) => selected.includes(d.date))
        .reduce((s, d) => s + d.estimatedAmount, 0),
    [waiting, selected],
  );
  const [amount, setAmount] = useState(estimated.toString());
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const openWishlist = state.rewards.filter((r) => !r.executed);
  const rebuilt = useMemo(() => {
    const fromRewards = state.rewards.filter((r) => r.executed);
    const covered = new Set(
      fromRewards.map((r) => r.id).concat(
        state.milestoneDecisions
          .filter((d) => d.rewardId)
          .map((d) => d.rewardId as string),
      ),
    );
    // Legacy saves before we wrote a reward row — still show in What I rebuilt.
    const legacySaves: Reward[] = state.milestoneDecisions
      .filter((d) => d.choice === "save" && (!d.rewardId || !covered.has(d.rewardId)))
      .filter((d) => !d.rewardId)
      .map((d) => ({
        id: `legacy_save_${d.id}`,
        name: d.note?.trim() || `Day ${d.dayNumber} save`,
        category: "other" as const,
        estimatedCost: 0,
        actualCost: 0,
        assignedMilestoneDay: d.dayNumber,
        executed: true,
        executedAt: d.createdAt,
        notes: `Day ${d.dayNumber} · Saved $ for future`,
        photoId: d.photoId,
        createdAt: d.createdAt,
      }));
    return [...fromRewards, ...legacySaves].sort((a, b) =>
      (b.executedAt || b.createdAt).localeCompare(a.executedAt || a.createdAt),
    );
  }, [state.rewards, state.milestoneDecisions]);
  const [rebuiltOpen, setRebuiltOpen] = useState(false);
  const pendingBonus = state.weeklyBonuses.find((b) => !b.confirmed);
  const treatBal = state.fund?.treat ?? 0;

  function toggleDay(date: string) {
    setSelected((prev) => {
      const nextSel = prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date];
      const est = waiting
        .filter((d) => nextSel.includes(d.date))
        .reduce((s, d) => s + d.estimatedAmount, 0);
      setAmount(String(est));
      return nextSel;
    });
  }

  function openEdit(r: Reward) {
    setEditingId(r.id);
    setShowAdd(false);
    setDraft({
      name: r.name,
      cost: String(r.estimatedCost),
      category: r.category,
      url: r.url ?? "",
      assignDay: r.assignedMilestoneDay ? String(r.assignedMilestoneDay) : "",
    });
  }

  function openCreate() {
    setEditingId(null);
    setShowAdd(true);
    setDraft(emptyDraft());
  }

  function cancelForm() {
    setEditingId(null);
    setShowAdd(false);
    setDraft(emptyDraft());
  }

  async function moveMoney() {
    setBusy(true);
    setMessage("");
    try {
      await post("/api/reclaim", {
        action: "transfer",
        dayDates: selected,
        amount: Number(amount),
      });
      setConfirming(false);
      setSelected([]);
      setAmount("0");
      setMessage(`$${amount} moved to Rebuild.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveReward() {
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        name: draft.name.trim(),
        estimatedCost: Number(draft.cost),
        category: draft.category,
        url: draft.url.trim() || undefined,
        milestoneDay: draft.assignDay ? Number(draft.assignDay) : undefined,
      };
      if (editingId) {
        await post("/api/rewards", {
          action: "update",
          id: editingId,
          ...payload,
          milestoneDay: draft.assignDay ? Number(draft.assignDay) : "",
        });
        setMessage("Reward updated.");
      } else {
        await post("/api/rewards", {
          action: "create",
          ...payload,
        });
        setMessage("Added to wishlist.");
      }
      cancelForm();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteReward(id: string) {
    if (!window.confirm("Remove this reward from your wishlist?")) return;
    setBusy(true);
    try {
      await post("/api/rewards", { action: "delete", id });
      if (editingId === id) cancelForm();
      setMessage("Reward removed.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function executeReward(id: string, cost: number) {
    const actual = window.prompt("Actual amount spent?", String(cost));
    if (actual == null) return;
    const why = window.prompt("What did you rebuild? (optional note)") || "";
    await post("/api/rewards", {
      action: "execute",
      id,
      actualCost: Number(actual),
      notes: why || undefined,
    });
  }

  async function confirmBonus(id: string) {
    await post("/api/reclaim", { action: "weekly_bonus", bonusId: id });
  }

  const formOpen = showAdd || editingId !== null;

  return (
    <main className="stack fade-in">
      <header className="page-header">
        <div>
          <p className="eyebrow">Shop</p>
          <h1>Rewards</h1>
          <p className="muted">
            Treat Yourself balance: <Money value={treatBal} />
          </p>
        </div>
        {!formOpen && (
          <button type="button" className="btn ghost" onClick={openCreate}>
            + Add
          </button>
        )}
      </header>

      {formOpen && (
        <section className="panel">
          <p className="eyebrow">{editingId ? "Edit reward" : "New reward"}</p>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="New pants, massage…"
            />
          </label>
          <div className="grid-2">
            <label className="field">
              <span className="field-label">Cost</span>
              <input
                type="number"
                value={draft.cost}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, cost: e.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Category</span>
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    category: e.target.value as RewardCategory,
                  }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span className="field-label">Buy link (URL)</span>
            <input
              type="url"
              value={draft.url}
              onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
              placeholder="https://…"
            />
          </label>
          <label className="field">
            <span className="field-label">Assign to milestone day (optional)</span>
            <input
              type="number"
              value={draft.assignDay}
              onChange={(e) =>
                setDraft((d) => ({ ...d, assignDay: e.target.value }))
              }
              placeholder="30"
            />
          </label>
          <PrimaryButton
            onClick={saveReward}
            disabled={!draft.name.trim() || !draft.cost || busy}
          >
            {editingId ? "Save changes" : "Add to wishlist"}
          </PrimaryButton>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {editingId && (
              <SecondaryButton
                onClick={() => deleteReward(editingId)}
                disabled={busy}
              >
                Delete reward
              </SecondaryButton>
            )}
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
          </div>
        </section>
      )}

      <section className="stack" style={{ marginTop: formOpen ? 14 : 0 }}>
        <p className="eyebrow">Wishlist</p>
        {openWishlist.length === 0 && !formOpen && (
          <div className="panel">
            <p className="muted" style={{ margin: 0 }}>
              Nothing on the wishlist yet — add something you want to earn.
            </p>
            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={openCreate}>Add a reward</PrimaryButton>
            </div>
          </div>
        )}
        <div className="shop-grid">
          {openWishlist.map((r) => {
            const affordable = treatBal >= r.estimatedCost;
            return (
              <article
                key={r.id}
                className={`shop-card${editingId === r.id ? " selected" : ""}`}
              >
                <button
                  type="button"
                  className="shop-card-main"
                  onClick={() => openEdit(r)}
                >
                  <strong className="shop-card-title">{r.name}</strong>
                  <span className="money shop-card-price">
                    <Money value={r.estimatedCost} />
                  </span>
                  <p className="tiny shop-card-meta">
                    {r.category}
                    {r.assignedMilestoneDay
                      ? ` · Day ${r.assignedMilestoneDay}`
                      : ""}
                    {affordable ? " · ready" : ""}
                  </p>
                </button>
                <div className="shop-card-actions">
                  {r.url && (
                    <a
                      className="btn ghost"
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Buy
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => executeReward(r.id, r.estimatedCost)}
                  >
                    Done
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {message && <p className="chip good success-pop">{message}</p>}

      {pendingBonus && (
        <section className="panel">
          <p className="eyebrow">Weekly gift</p>
          <p className="muted">
            All supports hit — move ${pendingBonus.amount} into Treat.
          </p>
          <PrimaryButton onClick={() => confirmBonus(pendingBonus.id)}>
            I moved ${pendingBonus.amount}
          </PrimaryButton>
        </section>
      )}

      {waiting.length > 0 && (
        <section className="panel">
          <p className="eyebrow">Money waiting</p>
          <p className="tiny">{waiting.length} days ready to move</p>
          <div className="list-check" style={{ marginTop: 12 }}>
            {waiting.map((d) => (
              <button
                key={d.date}
                type="button"
                className={
                  selected.includes(d.date) ? "check-item done" : "check-item"
                }
                onClick={() => toggleDay(d.date)}
              >
                <span className="check-box">
                  {selected.includes(d.date) ? "✓" : ""}
                </span>
                <div className="row" style={{ flex: 1 }}>
                  <span>{formatDisplayDate(d.date)}</span>
                  <Money value={d.estimatedAmount} />
                </div>
              </button>
            ))}
          </div>
          {!confirming ? (
            <div style={{ marginTop: 14 }}>
              <PrimaryButton
                disabled={selected.length === 0}
                onClick={() => setConfirming(true)}
              >
                Move ${estimated} to Rebuild
              </PrimaryButton>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <label className="field">
                <span className="field-label">Actual amount moved</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <PrimaryButton onClick={moveMoney} disabled={busy}>
                Confirm ${amount} moved
              </PrimaryButton>
              <div style={{ marginTop: 8 }}>
                <SecondaryButton onClick={() => setConfirming(false)}>
                  Cancel
                </SecondaryButton>
              </div>
            </div>
          )}
        </section>
      )}

      {rebuilt.length > 0 && (
        <section className="panel">
          <button
            type="button"
            className="rebuilt-toggle"
            aria-expanded={rebuiltOpen}
            onClick={() => setRebuiltOpen((v) => !v)}
          >
            <p className="eyebrow" style={{ margin: 0 }}>
              What I rebuilt
            </p>
            <span className={rebuiltOpen ? "caret open" : "caret"} aria-hidden>
              ▾
            </span>
          </button>
          {rebuiltOpen && (
            <div className="rebuilt-list fade-in">
              {rebuilt.map((r) => (
                <div key={r.id} className="support-row">
                  <div className="row">
                    <div>
                      <strong>{r.name}</strong>
                      {r.notes && <p className="tiny">{r.notes}</p>}
                      {r.url && (
                        <p className="tiny">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Link
                          </a>
                        </p>
                      )}
                    </div>
                    {(r.actualCost ?? r.estimatedCost) > 0 ? (
                      <Money value={r.actualCost ?? r.estimatedCost} />
                    ) : (
                      <span className="tiny">Saved</span>
                    )}
                  </div>
                  {r.photoId && (
                    <div className="trail-reward-photo" style={{ marginTop: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/photos/${encodeURIComponent(r.photoId)}`}
                        alt={r.name}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
