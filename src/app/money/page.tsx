"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { FundSegmentBar } from "@/components/MilestoneReward";
import {
  Money,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import { fundTotal } from "@/lib/fund";
import {
  daysAccounted,
  formatDisplayDate,
  moneyReinvested,
  nextMilestones,
  projectedReclaimAt,
  suggestedRewardPool,
  waitingReclaimDays,
} from "@/lib/journey";
import type { RewardCategory } from "@/lib/types";

export default function MoneyPage() {
  const { state, post, dashboard } = useApp();
  const waiting = waitingReclaimDays(state);
  const total = fundTotal(state.fund);
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

  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardCat, setRewardCat] = useState<RewardCategory>("wellness");
  const [assignDay, setAssignDay] = useState("");

  const { accounted, eligible } = daysAccounted(state);
  const next = nextMilestones(dashboard?.cleanDays ?? 0, 1)[0];
  const pendingBonus = state.weeklyBonuses.find((b) => !b.confirmed);

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
      setMessage(`$${amount} reclaimed. Days accounted for.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addReward() {
    setBusy(true);
    try {
      await post("/api/rewards", {
        action: "create",
        name: rewardName,
        estimatedCost: Number(rewardCost),
        category: rewardCat,
        milestoneDay: assignDay ? Number(assignDay) : undefined,
      });
      setRewardName("");
      setRewardCost("");
      setAssignDay("");
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

  return (
    <main className="stack fade-in">
      <header className="page-header">
        <div>
          <p className="eyebrow">Rebuild fund</p>
          <h1>Rewards</h1>
        </div>
      </header>

      <section className="panel">
        <p className="eyebrow">Venmo-matching total</p>
        <p className="money money-xl">
          <Money value={total} />
        </p>
        <p className="tiny">Must match your Venmo Rebuild balance</p>
        <FundSegmentBar fund={state.fund} />
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div>
            <p className="tiny">Reinvested (left Venmo)</p>
            <p className="money" style={{ fontSize: "1.4rem" }}>
              <Money value={moneyReinvested(state)} />
            </p>
          </div>
          <div>
            <p className="tiny">Days accounted</p>
            <p className="money" style={{ fontSize: "1.4rem" }}>
              {accounted} / {eligible}
            </p>
          </div>
        </div>
      </section>

      {waiting.length > 0 && (
        <section className="panel">
          <p className="eyebrow">Money is waiting for you</p>
          <h2>
            <Money
              value={waiting.reduce((s, d) => s + d.estimatedAmount, 0)}
            />
          </h2>
          <p className="tiny">{waiting.length} days ready</p>
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
              <p className="tiny">
                Confirm the amount you actually Venmo&apos;d / set aside.
                Difference from estimate is written off.
              </p>
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

      {message && (
        <p className="chip good success-pop">{message}</p>
      )}

      {pendingBonus && (
        <section className="panel">
          <p className="eyebrow">Weekly gift</p>
          <h2>You hit all supports</h2>
          <p className="muted">
            Move ${pendingBonus.amount} extra out of pocket into your treat —
            above and beyond reclaim.
          </p>
          <PrimaryButton onClick={() => confirmBonus(pendingBonus.id)}>
            I moved ${pendingBonus.amount}
          </PrimaryButton>
        </section>
      )}

      {next && state.profile && (
        <section className="panel">
          <p className="eyebrow">Reward forecast</p>
          <h2>
            Day {next.dayNumber} · {next.title}
          </h2>
          <p className="tiny">
            Projected at milestone:{" "}
            <Money value={projectedReclaimAt(state, next.dayNumber)} />
          </p>
          <p className="tiny">
            Suggested pool:{" "}
            <Money
              value={suggestedRewardPool(
                next.dayNumber,
                state.profile.historicalDailySpend,
              )}
            />{" "}
            (grows with later milestones)
          </p>
        </section>
      )}

      <section className="panel">
        <p className="eyebrow">Wishlist / shop</p>
        <label className="field">
          <span className="field-label">Reward name</span>
          <input
            value={rewardName}
            onChange={(e) => setRewardName(e.target.value)}
            placeholder="New pants, massage…"
          />
        </label>
        <div className="grid-2">
          <label className="field">
            <span className="field-label">Cost</span>
            <input
              type="number"
              value={rewardCost}
              onChange={(e) => setRewardCost(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Category</span>
            <select
              value={rewardCat}
              onChange={(e) => setRewardCat(e.target.value as RewardCategory)}
            >
              <option value="clothing">Clothing</option>
              <option value="wellness">Wellness</option>
              <option value="experiences">Experiences</option>
              <option value="growth">Growth</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field-label">Assign to milestone day (optional)</span>
          <input
            type="number"
            value={assignDay}
            onChange={(e) => setAssignDay(e.target.value)}
            placeholder={next ? String(next.dayNumber) : "30"}
          />
        </label>
        <SecondaryButton
          onClick={addReward}
          disabled={!rewardName || !rewardCost || busy}
        >
          Add reward
        </SecondaryButton>

        <div style={{ marginTop: 16 }}>
          {state.rewards.length === 0 && (
            <p className="tiny">No rewards yet — dangle something in front.</p>
          )}
          {state.rewards.map((r) => (
            <div key={r.id} className="support-row">
              <div className="row">
                <div>
                  <strong>{r.name}</strong>
                  <p className="tiny">
                    {r.category}
                    {r.assignedMilestoneDay
                      ? ` · Day ${r.assignedMilestoneDay}`
                      : ""}
                    {r.executed ? " · done" : ""}
                  </p>
                </div>
                <Money value={r.actualCost ?? r.estimatedCost} />
              </div>
              {!r.executed && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => executeReward(r.id, r.estimatedCost)}
                  >
                    Execute / What I Rebuilt
                  </button>
                </div>
              )}
              {r.executed && r.notes && (
                <p className="tiny" style={{ marginTop: 6 }}>
                  {r.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">What I rebuilt</p>
        {state.rewards.filter((r) => r.executed).length === 0 &&
          state.transfers.length === 0 && (
            <p className="muted">Your timeline of reinvestment will live here.</p>
          )}
        {state.rewards
          .filter((r) => r.executed)
          .map((r) => (
            <div key={r.id} className="support-row">
              <div className="row">
                <strong>{r.name}</strong>
                <Money value={r.actualCost ?? r.estimatedCost} />
              </div>
              {r.notes && <p className="tiny">{r.notes}</p>}
            </div>
          ))}
        {state.transfers.map((t) => (
          <div key={t.id} className="support-row">
            <div className="row">
              <span>Set aside · {formatDisplayDate(t.date)}</span>
              <Money value={t.amount} />
            </div>
            <p className="tiny">{t.dayDates.length} days accounted</p>
          </div>
        ))}
      </section>
    </main>
  );
}
