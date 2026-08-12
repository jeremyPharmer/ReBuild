# REBUILD — Product decisions (locked)

Last updated: 2026-08-12  
Status: **Ready to implement** — schedule, Treat/Save, fund ledger, daily/weekly loop, Fly envs.

---

## Environments

| Env | Purpose | Host |
|---|---|---|
| **dev** | Test / sample data; push freely without touching real journey | Fly.io (private) |
| **prod** | Founder true-source data | Fly.io (private) |

Separate data volumes/stores. Dev deploys must not overwrite prod.  
Venmo reconcile / link = later (UI totals first).

---

## Journey math

- One journey: cannabis + alcohol abstinence
- Combined historical daily spend
- Home: **ReBuilding for N days** = calendar days on the current abstinence run (**Day 1 = start date** / `currentRunStartedOn`, including the start day before any evening)
- Reclaim / Move to Rebuild from **every closed evening** (close always aligns for reclaim)
- **Reset my journey** (Settings) → run resets next calendar day; history kept; re-climb / re-achieve
- Return to use via evening alignment UI is **retired** (legacy `return_to_use` evenings still in history)
- No auth V1; honor system
- Weekly support 100% gift: **$20** out-of-pocket; **not** in Save-delay rule

---

## Daily + weekly loop (must feel worth opening every day)

Interactive every day:

**Morning** — Start the day (sleep, state, intention) → Today’s Rebuild supports  
**Day** — Log supports: recovery content (2/wk), meditation (5), medication (7), gym (4)  
**Evening** — Close the day: **Mood + Stress** (1–10), one-line journal, optional “anything specific stand out today?” → Move to Rebuild → Treat/Save if milestone  

Weekly supports are **targets** (not shame). Counts may go **above** the weekly goal (e.g. 5 of 2). Hitting all four unlocks **$20 treat gift** (out of pocket).  
Content log asks: “What will you do differently because of this?”

Closing the day **always counts as aligned** for reclaim / milestones. There is no evening “did you stay aligned?” card.

**Reset my journey** lives in **Settings** (bottom): confirm → same run reset as legacy return-to-use (history kept; clean-day counter restarts next calendar day).

---

## Milestone schedule (clean days this run)

Dense cashable **only at start**, then thin.

| Kind | Days | UX |
|---|---|---|
| Checkpoint | 1, 2, 5, 10, 21 | Celebrate only |
| Reward | 3, 7, 14, 45, 60, 75, 105, 120, 150, 210, 240, 300, 330 | Treat or Save |
| Destination | 30, 90, 180, 270, 365 | Both allowed; **Treat primary**, Save secondary |

First cashable: **Day 3**. Micro every-14: paused.

---

## Fund ledger (matches Venmo total)

**Locked model:** two buckets only — see also `product/FUND_MODEL.md`.

**Total (must match Venmo)** = Future + Treat Yourself  
= sum of user-confirmed Move to Rebuild amounts still set aside.

**What I Rebuilt / reinvested** = spent (left Venmo) → shown separately, **not** in Total.

### On each confirmed Move $X

| Bucket | Share | Horizon |
|---|---|---|
| Future | 30% | Longer-horizon park |
| Treat Yourself | 70% | Short-term spendable |

Not editable in V1. Big Total + segmented bar underneath.  
Legacy **Rebuild** bucket removed (any leftover folds into Future on normalize).

- **Treat Yourself** spend → debit **Treat** first; optionally **pull from Future** if item costs more than Treat  
- **Save for the Future** → skip spending this reward moment (does **not** move money into Treat)  
- Weekly $20 support gift → into **Treat** (OOP; not Save-delay)

Venmo drift / force-reconcile: later.

---

## Treat / Save rules

- Screen: **right after evening check-in** on Reward/Destination day  
- Choices: **Treat Yourself** or **Save for the Future**  
- Max **2 Saves for the Future in a row**; 3rd **must Treat** (Save hidden)  
- Treat resets delay counter  
- Wishlist claimable if **Treat + optional Future pull** covers cost  
- Auto **What I Rebuilt** (item + optional note)  
- Forced Treat: must pick or **create** wishlist item in-flow  

### Projected next-incentive pool

```text
projected = alreadyReclaimed + waitingReclaim + daysToGo × historicalDailySpend
```

(Suggested-save curve that moved money into Treat is **retired**.)

---

## Deferred

- Micro-reward every 14 days  
- Persistent Home reward card  
- Venmo API / bank verify / reconcile flow  
- Editable segment amounts  
- AI, travel polish, community  
