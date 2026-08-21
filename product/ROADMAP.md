# ReBuild product roadmap

Living roadmap for **ReBuild** — a recovery app with incentives.

Maintained by the **Head of Product** agent (`.cursor/agents/head-of-product.md`).  
**Priority ranking is the primary planning signal.** Due dates, effort, and timeline support rank — they do not override it.

Last updated: 2026-08-21

## Current focus

| Rank | ID | Item | Priority | Status | Effort | Target due |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-011 | Auto-credit daily savings when the day ends | P0 | In Progress | S | TBD |
| 2 | RB-001 | Auto-pull funds: checking → Venmo | P0 | Backlog | L | TBD |
| 3 | RB-005 | Recovery content: weekly podcast & book offers | P0 | Backlog | M | TBD |
| 4 | RB-006 | Fund buckets: Future + Treat @ 30/70 | P0 | Backlog | M | TBD |

## Now / Next / Later

### Now

**Shipped to prod:** RB-007 (accounts + trail onboarding).  

**Next open P0 (do first):** **RB-011** — end-of-day auto-credit of `historicalDailySpend` → waiting reclaim (close optional; no double credit). Incentive integrity / fund honesty. **In Progress** (Reese: ensure-on-read catch-up + evening ensure).

Then open P0s: RB-001 (Venmo), RB-005 (weekly recovery content), RB-006 (two-bucket fund).

**In Progress (P1 daily-loop):** RB-009 (recovery patterns) and **RB-010** (backfill missed evening / journal close + Journal nav scroll fix). RB-010 is **journal** backfill only — funds accrual is RB-011.

### Next

1. **RB-011 — Auto-credit daily savings when the day ends (v1)**  
   When a day ends, credit waiting-to-reclaim whether or not evening was closed. Evening close uses the same idempotent ensure. Detail: [`items/auto-credit-daily-savings-end-of-day.md`](./items/auto-credit-daily-savings-end-of-day.md).
2. **RB-001 — Auto-pull funds: checking → Venmo (v1)**  
   Auto-pull from linked checking into Venmo for incentive flows (needs per-user identity from RB-007).
3. **RB-005 — Recovery content: weekly podcast & book offers**  
   Each week, show **two selectable** offers (podcasts and/or books) in the recovery content box.
4. **RB-006 — Fund buckets: Future + Treat @ 30/70**  
   Future = long-horizon park; Treat = short-term. Reward day: Treat Yourself (optional Future pull) or Save for the Future. UXUI review: [`UX_HANDOFF_FUND_BUCKETS.md`](./UX_HANDOFF_FUND_BUCKETS.md).
5. **RB-009 — Recovery patterns (Journey)** — **In Progress**  
   High v1 slice shipping to **rebuild-dev**: playbook, headwind hours, 4-week provision rhythm. No sixth nav tab. Detail: [`items/recovery-patterns-insights.md`](./items/recovery-patterns-insights.md).
6. **RB-010 — Backfill missed evening / journal close** — **In Progress**  
   Select a missing day in the current run and complete evening close via the existing path. Companion: Journal bottom-nav scroll overlap fix. **Does not** own fund auto-credit (see RB-011). Detail: [`items/backfill-missed-evening-journal-close.md`](./items/backfill-missed-evening-journal-close.md).

### Later

1. **RB-002 — Email integration** — shared email channel (enables digests + forgot-password delivery for RB-007)
2. **RB-003 — Daily email: open checklist at close of day** — leftover open checklist items; close-the-day UX stays as-is
3. **RB-004 — SMS integration** — transactional SMS channel
4. **RB-008 — Segregated ReBuild account (feasibility)** — Move money → real hold; Acorns outreach + rails shortlist (BaaS vs ACH wallet vs Venmo-only). Does **not** replace Venmo v1. Research: [`research/acorns-partner-rails-feasibility.md`](./research/acorns-partner-rails-feasibility.md)
5. Alternate payment destination: checking → **soccer bank account** (follow-on to Venmo v1)
6. In-app how-to walkthrough (explicitly deferred from RB-007 v1)

## Timeline (draft)

| Window | Planned | Notes |
| --- | --- | --- |
| Done (prod) | RB-007 accounts + onboarding trail + admin + prod migrate | Effort **XL**; platform prerequisite |
| Next (fund honesty) | RB-011 end-of-day reclaim auto-credit | Effort **S**; P0; idempotency with evening close; does not need Venmo |
| Unscheduled | RB-001 discovery + build | Effort **L**; after/with identity |
| Unscheduled | RB-005 weekly 2-offer rotation (podcasts + books) | Effort **M**; backlog/consider |
| With fund/Money work | RB-006 two-bucket + reward Treat/Save UX | Effort **M**; UXUI review requested |
| After open P0s (v1.x) | RB-009 recovery patterns on Journey | Effort **M**; daily-loop payoff; does not need Venmo |
| Shipping with daily-loop polish (v1.x) | RB-010 backfill missed evening close | Effort **S**; journal only; coordinate reclaim idempotency with RB-011 |
| After RB-001 v1 / with accounts | RB-002 → forgot-password live + RB-003 | Email platform first, then daily digest |
| After email path (or parallel if capacity) | RB-004 SMS | P2 |
| Parallel discovery (does not block Venmo v1) | RB-008 segregated hold feasibility | Effort **S**; Acorns email + rails shortlist; production rails would be **XL** follow-on |
| After RB-001 v1 | Soccer / alternate bank destination | Explicitly deferred |

## Ranking principles

1. User-value and recovery/incentive integrity first
2. Ship a thin v1 over boiling the ocean (Venmo before multi-destination; weekly two offers before a media platform; two fund buckets over three)
3. Compliance and trust risks can raise rank, not bury the item
4. Platform prerequisites (auth / multi-user) outrank features that need per-user identity
5. No silent reordering — document why rank changed in the item Notes

## How to update

Use the **head-of-product** agent or the **product-roadmap** skill. Keep `ROADMAP.md`, `BACKLOG.md`, and `product/items/*` aligned.
