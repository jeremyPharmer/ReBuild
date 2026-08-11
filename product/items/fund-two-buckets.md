# Fund buckets: collapse to Future + Treat @ 50/50

| Field | Value |
| --- | --- |
| ID | RB-006 |
| Rank | 3 |
| Priority | P0 |
| Status | Backlog |
| Effort | S |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

Three fund buckets (Future / Rebuild / Treat @ 50/25/25) don’t match a clear user mental model. **Rebuild** as a middle “life spends” lane overlaps Future and Treat and adds UI noise.

## Outcome

Ledger and Money UI use **two buckets only**: Future and Treat Yourself, split **50/50** on each Move. See `product/FUND_MODEL.md`.

## Scope (v1)

- Replace 50/25/25 split with 50/50 Future / Treat
- Remove Rebuild segment from fund bar and state
- Save & compound pulls into Treat from Future only
- Update copy / tests on the app branch

## Out of scope

- Editable split percentages
- Venmo API reconcile (still later)

## Notes

- Locked 2026-08-11 by product. Ranked #3 so it lands with fund/Venmo work; Venmo auto-pull stays #1, recovery content #2.
