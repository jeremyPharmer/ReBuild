# Segregated ReBuild account (Move money → real hold)

| Field | Value |
| --- | --- |
| ID | RB-007 |
| Rank | 7 |
| Priority | P1 |
| Status | Backlog |
| Effort | S |
| Target due | TBD |
| Milestone | later |
| Owner | Product |

## Problem

Founder discovery (Jeremy): when the user taps **Move money**, ReBuild should pull from their existing bank checking and deposit into a **segregated ReBuild holding account** (checking/savings) where saved funds sit — a real hold, not only a peer wallet. Acorns was explored because of SoberSave’s Acorns marketing and a desire for little-to-no consumer cost. UI setup is later; **feasibility first**.

## Outcome

A written feasibility decision: whether (and how) ReBuild can fund a segregated hold on Move money, with Acorns outreach complete, a shortlist of 2–3 viable rails, and a clear relationship to **Venmo as locked v1 destination** (RB-001). Full production rails are a follow-on item.

## Scope (v1 of this item — discovery only)

- Capture research verdict in [`product/research/acorns-partner-rails-feasibility.md`](../research/acorns-partner-rails-feasibility.md)
- Outreach to Acorns Partner API (`partner-api@acorns.com`) to confirm whether any partner funding path exists beyond read/data access
- Shortlist **2–3 rails**: BaaS (Column / Unit / Treasury Prime) vs ACH + wallet (Moov / Plaid Transfer / Dwolla) vs stay Venmo-only for longer
- Decision memo: recommend path for post–Venmo-v1 (or stay Venmo), including consumer-cost and compliance notes

## Out of scope / later

- UI bank-link setup polish
- Full production BaaS / wallet launch (expect **XL** follow-on if greenlit)
- Changing locked fund split (`FUND_MODEL.md`) or displacing Venmo as v1 destination (`PRODUCT_DECISIONS` / RB-001)
- Soccer / alternate personal bank destination (separate Later note on roadmap)

## Dependencies & risks

- **Related:** [RB-001 — Auto-pull funds: checking → Venmo](./auto-pull-funds-venmo.md) remains **P0 rank 1** and locked v1 destination; this item explores an **alternate later hold**, not a replacement for Venmo v1
- Banks generally do not expose free public APIs to open a customer account and ACH-debit another bank without a fintech/BaaS program
- BaaS path: KYC, bank partnership, compliance, money-transmission considerations; pricing custom
- Acorns public Partner API appears read/data-focused; consumer subscription ($3/$6/$12 mo) conflicts with little/no consumer cost unless an unpublished partner funding product exists
- Do **not** edit locked `FUND_MODEL.md` or Venmo-as-v1 decisions based on this discovery alone

## Notes

- Intake: 2026-08-13 from founder discovery (Jeremy). Rank **7** (Later) — does not displace RB-001.
- Priority **P1**: strategic money-rail discovery, but after v1 P0s and email path; before/alongside other Later channel work by rank order.
- Effort **S** = discovery + outreach + shortlist memo only. Production segregated account = separate **XL** item if approved.
- Draft outreach target: `partner-api@acorns.com` — full ready-to-send email lives in the research doc.
- SoberSave is a third-party recovery app with affiliate investment links, not proof that Acorns Partner API moves money for partners.
