"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Money, PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  availableShopRewards,
  lastShopReward,
  otherShopRewards,
  shoppingTreatBudget,
} from "@/lib/fund";
import { cleanDaysThisRun, nextIncentive } from "@/lib/journey";
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
  const { state, post, today } = useApp();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [otherOpen, setOtherOpen] = useState(true);
  const [checkingOut, setCheckingOut] = useState<Reward | null>(null);
  const [spent, setSpent] = useState("");

  const shopMoment = lastShopReward(state);
  const budget = shoppingTreatBudget(state);
  const available = availableShopRewards(state);
  const other = otherShopRewards(state);
  const pendingBonus = state.weeklyBonuses.find((b) => !b.confirmed);
  const cleanDays = cleanDaysThisRun(state, today);
  const nextShop = shopMoment ? undefined : nextIncentive(cleanDays);
  const formOpen = showAdd || editingId !== null;
  const spentNum = Number(spent);
  const checkoutCost =
    checkingOut && Number.isFinite(spentNum) && spentNum > 0
      ? spentNum
      : (checkingOut?.estimatedCost ?? 0);
  const checkoutOk =
    Boolean(checkingOut) &&
    Number.isFinite(checkoutCost) &&
    checkoutCost > 0 &&
    checkoutCost <= budget;

  function openEdit(r: Reward) {
    setCheckingOut(null);
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
    setCheckingOut(null);
    setEditingId(null);
    setShowAdd(true);
    setDraft(emptyDraft());
  }

  function cancelForm() {
    setEditingId(null);
    setShowAdd(false);
    setDraft(emptyDraft());
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
        setMessage("Added to Rewards.");
      }
      cancelForm();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteReward(id: string) {
    if (!window.confirm("Remove this reward from your list?")) return;
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

  function startCheckout(r: Reward) {
    setMessage("");
    setCheckingOut(r);
    setSpent(String(r.estimatedCost));
    cancelForm();
  }

  async function confirmCheckout() {
    if (!checkingOut || !checkoutOk) return;
    setBusy(true);
    setMessage("");
    try {
      await post("/api/rewards", {
        action: "execute",
        id: checkingOut.id,
        actualCost: checkoutCost,
      });
      setCheckingOut(null);
      setMessage("Treat yourself — nice.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmBonus(id: string) {
    await post("/api/reclaim", { action: "weekly_bonus", bonusId: id });
  }

  function RewardCard({
    reward,
    shoppable,
  }: {
    reward: Reward;
    shoppable: boolean;
  }) {
    const short = Math.max(0, reward.estimatedCost - budget);
    return (
      <article className={`shop-card${shoppable ? " ready" : ""}`}>
        <button
          type="button"
          className="shop-card-main"
          onClick={() => (shoppable ? startCheckout(reward) : openEdit(reward))}
        >
          <strong className="shop-card-title">{reward.name}</strong>
          <span className="money shop-card-price">
            <Money value={reward.estimatedCost} />
          </span>
          <p className="tiny shop-card-meta">
            {reward.category}
            {reward.assignedMilestoneDay
              ? ` · Day ${reward.assignedMilestoneDay}`
              : ""}
            {!shoppable && budget > 0 && short > 0
              ? ` · $${Math.round(short)} more`
              : ""}
          </p>
        </button>
        <div className="shop-card-actions">
          {reward.url && (
            <a
              className="btn ghost"
              href={reward.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Buy
            </a>
          )}
          {shoppable ? (
            <button
              type="button"
              className="btn primary shop-card-buy"
              onClick={() => startCheckout(reward)}
            >
              Treat yourself
            </button>
          ) : (
            <button
              type="button"
              className="btn ghost"
              onClick={() => openEdit(reward)}
            >
              Edit
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="stack fade-in rewards-page">
      <header>
        <p className="eyebrow">Shop</p>
        <h1>Rewards</h1>
      </header>

      {message && (
        <p className="chip good success-pop" style={{ margin: 0 }}>
          {message}
        </p>
      )}

      <section className="panel shop-wallet">
        <p className="shop-wallet-amount">
          <Money value={budget} />
        </p>
        {shopMoment ? (
          <>
            <p className="shop-wallet-label">
              to shop · Day {shopMoment.dayNumber} · {shopMoment.title}
            </p>
            <p className="tiny" style={{ marginTop: 8, lineHeight: 1.45 }}>
              Treat Yourself through this reward. Later Moves wait for the next
              one.
            </p>
          </>
        ) : (
          <>
            <p className="shop-wallet-label">to shop</p>
            <p className="tiny" style={{ marginTop: 8, lineHeight: 1.45 }}>
              {nextShop
                ? `Opens at Day ${nextShop.dayNumber} · ${nextShop.title}.`
                : "The next reward will open the shop."}
            </p>
          </>
        )}
      </section>

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

      <section className="stack">
        <p className="eyebrow">Available now</p>
        {available.length === 0 ? (
          <div className="panel">
            <p className="muted" style={{ margin: 0, lineHeight: 1.45 }}>
              {budget <= 0
                ? "Nothing in the shop yet. Your other rewards are below."
                : "Nothing in range yet — add one at or under this balance, or pick from Other rewards."}
            </p>
          </div>
        ) : (
          <div className="shop-grid">
            {available.map((r) => (
              <RewardCard key={r.id} reward={r} shoppable />
            ))}
          </div>
        )}
      </section>

      {other.length > 0 && (
        <section className="panel">
          <button
            type="button"
            className="rebuilt-toggle"
            aria-expanded={otherOpen}
            onClick={() => setOtherOpen((v) => !v)}
          >
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>
                Other rewards
              </p>
              <p className="tiny" style={{ marginTop: 4 }}>
                {other.length} saved
                {budget > 0 ? ` · over $${Math.round(budget)}` : ""}
              </p>
            </div>
            <span className={otherOpen ? "caret open" : "caret"} aria-hidden>
              ▾
            </span>
          </button>
          {otherOpen && (
            <div className="shop-grid fade-in" style={{ marginTop: 12 }}>
              {other.map((r) => (
                <RewardCard key={r.id} reward={r} shoppable={false} />
              ))}
            </div>
          )}
        </section>
      )}

      {!formOpen && !checkingOut && (
        <button type="button" className="shop-add-bar" onClick={openCreate}>
          Add a reward
        </button>
      )}

      {formOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !busy && cancelForm()}
        >
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit reward" : "New reward"}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">{editingId ? "Edit reward" : "New reward"}</p>
            <label className="field">
              <span className="field-label">Name</span>
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
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
                onChange={(e) =>
                  setDraft((d) => ({ ...d, url: e.target.value }))
                }
                placeholder="https://…"
              />
            </label>
            <label className="field">
              <span className="field-label">
                Assign to milestone day (optional)
              </span>
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
              {editingId ? "Save changes" : "Add reward"}
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
          </div>
        </div>
      )}

      {checkingOut && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !busy && setCheckingOut(null)}
        >
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Treat yourself"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Treat yourself</p>
            <h2>{checkingOut.name}</h2>
            <p className="tiny" style={{ marginTop: 6 }}>
              Shop budget <Money value={budget} />
              {shopMoment
                ? ` · Day ${shopMoment.dayNumber} ${shopMoment.title}`
                : ""}
            </p>
            <label className="field" style={{ marginTop: 12 }}>
              <span className="field-label">How much did you spend?</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
              />
            </label>
            {checkoutCost > budget && (
              <p className="tiny" style={{ color: "var(--danger)" }}>
                That&apos;s more than Treat Yourself from this reward.
              </p>
            )}
            <PrimaryButton
              onClick={confirmCheckout}
              disabled={!checkoutOk || busy}
            >
              Confirm
            </PrimaryButton>
            <div style={{ marginTop: 8 }}>
              <SecondaryButton
                onClick={() => setCheckingOut(null)}
                disabled={busy}
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
