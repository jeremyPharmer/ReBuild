# Auto-pull funds: checking → Venmo

| Field | Value |
| --- | --- |
| ID | RB-001 |
| Rank | 2 |
| Priority | P0 |
| Status | Backlog |
| Effort | L |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

Users need funds moved automatically from a linked checking account into a destination used by ReBuild’s incentive / recovery flows. Manual transfers create friction and drop-off.

## Outcome

ReBuild can initiate an automatic pull from a user’s checking account and deposit into **Venmo** (v1), so incentive-related money movement is reliable without manual steps.

## Scope (v1)

- Link / authorize a checking account as the funding source
- Auto-pull (ACH or equivalent) into **Venmo** as the destination
- User-visible confirmation of pull success / failure
- Basic retry / error handling for failed pulls
- Audit trail suitable for support and trust

## Out of scope / later

- Destination: alternate **soccer bank account** (or other dedicated checking destination) — track as a follow-on after Venmo v1
- Multi-destination routing in one flow
- Complex scheduling rules beyond the initial auto-pull behavior (unless required for a minimal viable pull)

## Dependencies & risks

- Venmo / payment-rail API access, ToS, and compliance (KYC, money-transmission constraints)
- Bank linking UX and auth (Plaid or equivalent may be required)
- Failure modes: insufficient funds, revoked auth, delayed ACH settlement
- User trust: clear consent copy before any auto-pull

## Notes

- Product decision (2026-08-10): **Venmo is the v1 destination.** Soccer / alternate bank account is explicitly later — do not block v1 on it.
- Added to product backlog as highest rank (1).
