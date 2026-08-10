# ReBuild product roadmap

Living roadmap for **ReBuild** — a recovery app with incentives.

Maintained by the **Head of Product** agent (`.cursor/agents/head-of-product.md`).  
**Priority ranking is the primary planning signal.** Due dates, effort, and timeline support rank — they do not override it.

Last updated: 2026-08-10

## Current focus

| Rank | ID | Item | Priority | Status | Effort | Target due |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-001 | Auto-pull funds: checking → Venmo | P0 | Backlog | L | TBD |
| 2 | RB-005 | Recovery content: podcast recommendations | P0 | Backlog | S | TBD |

## Now / Next / Later

### Now

_Nothing in progress._ Top items: RB-001 (Venmo), then RB-005 (recovery podcast offers).

### Next

1. **RB-001 — Auto-pull funds: checking → Venmo (v1)**  
   Auto-pull from linked checking into Venmo for incentive flows.
2. **RB-005 — Recovery content: podcast recommendations**  
   Curated podcast offers (Rich Roll + complementary recovery shows) inside the recovery content box. Consider / backlog only — do not build yet.

### Later

1. **RB-002 — Email integration** — shared email channel (enables digests)
2. **RB-003 — Daily email: open checklist at close of day** — leftover open checklist items; close-the-day UX stays as-is
3. **RB-004 — SMS integration** — transactional SMS channel
4. Alternate payment destination: checking → **soccer bank account** (follow-on to Venmo v1)

## Timeline (draft)

| Window | Planned | Notes |
| --- | --- | --- |
| Unscheduled | RB-001 discovery + build | Effort **L**; due TBD |
| Unscheduled (after / beside payments planning) | RB-005 curation + light offers UI | Effort **S**; backlog/consider — not building yet |
| After RB-001 v1 | RB-002 → RB-003 | Email platform first, then daily digest |
| After email path (or parallel if capacity) | RB-004 SMS | P2 |
| After RB-001 v1 | Soccer / alternate bank destination | Explicitly deferred |

## Ranking principles

1. User-value and recovery/incentive integrity first
2. Ship a thin v1 over boiling the ocean (Venmo before multi-destination; curated podcasts before a media platform)
3. Compliance and trust risks can raise rank, not bury the item
4. No silent reordering — document why rank changed in the item Notes

## How to update

Use the **head-of-product** agent or the **product-roadmap** skill. Keep `ROADMAP.md`, `BACKLOG.md`, and `product/items/*` aligned.
