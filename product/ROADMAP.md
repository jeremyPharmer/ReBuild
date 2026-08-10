# ReBuild product roadmap

Living roadmap for **ReBuild** — a recovery app with incentives.

Maintained by the **Head of Product** agent (`.cursor/agents/head-of-product.md`).  
**Priority ranking is the primary planning signal.** Due dates, effort, and timeline support rank — they do not override it.

Last updated: 2026-08-10

## Current focus

| Rank | ID | Item | Priority | Status | Effort | Target due |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-001 | Auto-pull funds: checking → Venmo | P0 | Backlog | L | TBD |

## Now / Next / Later

### Now

_Nothing in progress._ Top backlog item is RB-001 (Venmo auto-pull).

### Next

1. **RB-001 — Auto-pull funds: checking → Venmo (v1)**  
   Auto-pull from linked checking into Venmo for incentive flows. Discovery needed on bank-link + Venmo rails before committing a due date.

### Later

- Alternate destination: checking → **soccer bank account** (or other dedicated account) — follow-on to Venmo v1, not in v1 scope.

## Timeline (draft)

| Window | Planned | Notes |
| --- | --- | --- |
| Unscheduled | RB-001 discovery + build | Effort **L**; due date stays TBD until payment-rail constraints are known |
| After RB-001 v1 | Soccer / alternate bank destination | Explicitly deferred |

## Ranking principles

1. User-value and recovery/incentive integrity first
2. Ship a thin v1 over boiling the ocean (Venmo before multi-destination)
3. Compliance and trust risks can raise rank, not bury the item
4. No silent reordering — document why rank changed in the item Notes

## How to update

Use the **head-of-product** agent or the **product-roadmap** skill. Keep `ROADMAP.md`, `BACKLOG.md`, and `product/items/*` aligned.
