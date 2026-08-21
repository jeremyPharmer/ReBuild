# Backfill missed evening / journal close

| Field | Value |
| --- | --- |
| ID | RB-010 |
| Rank | 7 |
| Priority | P1 |
| Status | In Progress |
| Effort | S |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product (build: Reese evening path + UXUI Journal) |

## Problem

If a user misses closing a past day, they cannot add that evening / journal entry later. Gaps break the daily loop trail and leave Journal incomplete. Separately, Journal scroll content is obscured by the bottom nav.

## Outcome

User can pick a missing calendar day in the current run (no evening close yet) and complete the evening entry via the existing close path. Journal days remain reachable while scrolling (nav no longer covers content).

## Scope (v1)

- Select missing calendar day(s) in the **current run** that lack an evening close
- Complete mood / stress / one-line (optional standout) through the **existing evening close** path
- Same evening / milestone side effects as a same-day close; reclaim ensure stays idempotent (may already exist from [RB-011](./auto-credit-daily-savings-end-of-day.md) end-of-day credit)
- Journal screen: fix bottom-nav overlap so days stay visible while scrolling

## Out of scope / later

- Editing past entries
- Morning backfill
- Bulk multi-day close in one submit
- Days outside the current run
- Auto-crediting waiting reclaim without a journal entry — that is **RB-011**, not this item

## Dependencies & risks

- Must reuse existing evening / reclaim / milestone mutations so incentives stay consistent
- Day selection UX should make “already closed” vs “missing” obvious
- Coordinate with RB-011 so backfill never double-credits `reclaimDays`

## Notes

- Ranked as first daily-loop polish after RB-009; does **not** displace Venmo / fund / content P0s (RB-001, RB-005, RB-006) — nor **RB-011** (auto-credit daily savings)
- **Not the same as RB-011:** this item is journal / evening backfill UX. Funds waiting-to-reclaim for a missed close are owned by [RB-011](./auto-credit-daily-savings-end-of-day.md) (end-of-day auto-credit). After RB-011, backfilling an evening must not double-credit reclaim (existing `ensureReclaimDay` idempotency).
- Shipping in the same PR as Journal bottom-nav scroll padding fix
- Rank assigned 2026-08-20 (intake); renumbered to **7** on 2026-08-21 when RB-011 took rank 2
