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
- Added to product backlog as highest rank (1); renumbered to rank **2** on 2026-08-13 when RB-007 (accounts + onboarding) took rank 1 — Venmo needs per-user identity.
- 2026-08-13: Acorns / segregated ReBuild hold explored as a **later alternate destination** (not replacing Venmo v1) — see [RB-008](./segregated-rebuild-account-rails.md) and research [`acorns-partner-rails-feasibility.md`](../research/acorns-partner-rails-feasibility.md).
- **2026-08-13 feasibility (Move money → Venmo pull):** There is **no official Venmo/PayPal partner API** that lets ReBuild trigger “Add Money” from the user’s linked checking into their Venmo balance. Auto Reload / Schedule Add Money exist **only inside the Venmo app** and cannot be fired by ReBuild on Move money. Unofficial reverse‑engineered clients exist and are ToS‑risky — not an option. Official PayPal **Payouts to Venmo** sends money *from ReBuild’s business balance* → user Venmo (opposite direction; ReBuild must already hold the cash). **Practical implication for Venmo-as-hold:** user still funds Venmo themselves (manual Add Money, or Venmo’s own Auto Reload/Schedule), while ReBuild ledger stays honor-system / deep-link UX — or we use a non-Venmo rail for true push-to-pull.
- **2026-08-13 stronger 1-tap candidate (RB-008):** **Me-to-me ACH** (Dwolla/Moov): user’s checking → user’s own free HYSA (Ally/etc). ReBuild orchestrates; does not hold funds. May supersede Venmo as the *technical* destination for auto-pull even if Venmo remains a product/UI metaphor — decide after Dwolla eligibility call.
