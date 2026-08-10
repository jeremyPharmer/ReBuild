# REBUILD — Product decisions (locked)

Last updated: 2026-08-10  
Status: Schedule + Treat/Save rules locked. Suggested-save **formula** pending founder confirm below.

---

## Environments

| Env | Purpose | Host |
|---|---|---|
| **dev** | Test / sample data; push freely without touching real journey | Fly.io (private) |
| **prod** | Founder true-source data | Fly.io (private) |

Separate data stores. Dev deploys must not overwrite prod.

---

## Journey math (earlier locks)

- One journey: cannabis + alcohol abstinence
- Combined historical daily spend
- Home label: **ReBuilding for N days** = clean days **this run**
- Abstinence advances the day counter; reclaim/Venmo is separate
- Return to use → run counter resets to 0; milestone history kept; re-climb / re-achieve allowed
- Reward pools grow with later milestones
- No auth V1; honor system
- Weekly support 100% gift: **$20** out-of-pocket; does **not** count toward Save-delay rule

---

## Milestone schedule (clean days this run)

Dense cashable rewards **only at the start**. Then thin.

### Checkpoints — celebrate only
`1, 2, 5, 10, 21` (+ optional light map markers later)

### Rewards — Treat Yourself **or** Save & compound
`3, 7, 14, 45, 60, 75, 105, 120, 150, 210, 240, 300, 330`

### Destinations — both allowed; **stronger Treat prompt** (Treat primary, Save secondary)
`30, 90, 180, 270, 365`

First cashable treat: **Day 3**.

Micro every-14 checkpoints: **paused** (not in V1 this slice).

---

## Treat Yourself pool & Save rules

### When the screen appears
Right after evening check-in on the day a Reward or Destination is hit.  
No persistent “reward waiting” card in this slice.

### Choices
- **Treat Yourself** — spend from Treat Yourself pool on an **eligible** wishlist item  
- **Save & compound** — move $ into Treat Yourself pool (milestone still **achieved**)

### Delay rule
- Max **2 Saves in a row**
- **3rd** reward/destination moment **must** Treat (Save hidden)
- After a Treat, delay counter **resets to 0**
- Weekly $20 gift does **not** count toward this rule

### Wishlist eligibility
- Can add aspirational items at any price
- Item is **claimable only if** Treat Yourself pool **≥ item cost**
- Otherwise: wait, Save more, or pick a cheaper eligible item

### Treat spend
- May spend **partial** pool (e.g. pool $50, spend $40 → **$10 stays** in Treat pool)
- Auto-log to **What I Rebuilt** (item + optional note)

### Save amount
- UI shows a **suggested** $ amount clearly
- User may **edit** the amount down (or adjust) before confirm
- If suggested **$84** and user saves **$50**: the **$34 stays in general Rebuild / reclaimed money** — it does **not** enter the Treat Yourself pool

---

## Where does “suggested Save $84” come from?

`$84` in earlier examples was **illustrative**, not a magic constant.

### Current code formula (`suggestedRewardPool`)

```text
curve = 0.35 + (min(dayNumber, 365) / 365) * 0.45
suggested = round(historicalDailySpend × dayNumber × curve)
```

Intent:
- Scales with **day number** (later milestones → larger suggested treats)
- Scales with **daily historical spend**
- `curve` starts ~0.35 and rises toward ~0.80 by Day 365 so later destinations feel bigger

### Examples at $40/day historical spend

| Day | Type | Approx suggested |
|---|---|---|
| 3 | Reward | ~$42 |
| 7 | Reward | ~$100 |
| 14 | Reward | ~$205 |
| 30 | Destination | ~$463 |
| 45 | Reward | ~$730 |
| 90 | Destination | ~$1,660 |

*(Exact ints come from the formula; table is for intuition.)*

### Founder confirm needed

Is this formula OK for V1 suggested Save, or should suggested Save be something else, e.g.:

1. **Keep formula** (above)  
2. **Fixed % of reclaim since last Treat/Save** (e.g. 25% of newly reclaimed)  
3. **Fixed $ tiers** by milestone band (e.g. Day 3 = $25, Day 7 = $40, Day 14 = $75…)  
4. **Other** — specify  

Until confirmed, engineering should not hard-wire UX copy around a final number.

---

## Explicitly deferred

- Micro-reward every 14 clean days (paused)
- Persistent reward card on Home
- Venmo API / bank verify
- AI coach
- Travel mode polish
- 50/25/25 visible buckets (may surface later if UI fits)

---

## Implementation gate

Do **not** ship Treat/Save UI + Fly dev/prod until:

- [x] Schedule locked  
- [x] A–D product rules locked (see above)  
- [x] C2 leftover Treat $ stays in pool  
- [x] C1 unused suggested $ stays in general Rebuild  
- [x] B eligibility = pool ≥ cost  
- [ ] Suggested-save **source formula** confirmed (this section)  
- [ ] Fly.io app names / org access available for `rebuild-dev` + `rebuild-prod` (or equivalent)
