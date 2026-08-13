# Acorns / segregated hold — rails feasibility

**Status:** Research captured (2026-08-13) — outreach pending  
**Related backlog:** [RB-007](../items/segregated-rebuild-account-rails.md) (discovery) · [RB-001](../items/auto-pull-funds-venmo.md) (Venmo v1 — locked, not replaced)  
**Owner:** Product (Jeremy / Oscar)

## Desired UX (founder)

When the user taps **Move money**, pull from their existing bank checking and deposit into a **segregated ReBuild holding account** (checking/savings) where saved funds sit. Exploring Acorns because of SoberSave’s Acorns marketing; wants **little-to-no consumer cost**. UI setup later — feasibility first.

**Relationship to locked decisions:** Venmo remains the **v1 destination** (RB-001 / PRODUCT_DECISIONS). This research explores a **later alternate** real-hold destination. Do not change `FUND_MODEL.md` or Venmo-as-v1 without an explicit product decision.

---

## Research verdict

### 1. Acorns Partner API

- Docs: https://developer.acorns.com/  
- Contact: partner-api@acorns.com  
- OAuth 2.0 for third parties to **access user data** (partner/aggregator).  
- Public docs describe **read/data access**, not initiating ACH deposits or investments.  
- Onboarding required; not self-serve.  
- Consumer must pay Acorns subscription (**$3 / $6 / $12 mo**) — fails “little to no cost to consumer” unless waived via an unpublished partner deal.

### 2. SoberSave ≠ Acorns product

- SoberSave is a third-party recovery app (not an Acorns product).  
- App Store disclosure: “Investment links are affiliate.”  
- Marketing says “auto-invest with Acorns” — likely affiliate / deep-link into Acorns’ own funding UX, **not** partner-initiated money movement.  
- Not a proven model that Partner API moves money for partners.

### 3. Banks / public APIs

Banks generally **do not** expose free public APIs for a third-party app to open a customer account and ACH-debit another bank into it without becoming a fintech / BaaS program.

### 4. Rails that can actually do the job

Cost mostly on ReBuild/platform; consumer can be **$0**:

| Path | Examples | Notes |
| --- | --- | --- |
| **BaaS / platform bank** | Column, Unit, Treasury Prime | Open FDIC checking/savings per user; ACH debit external checking → ReBuild account. Heavy: KYC, bank partnership, compliance, money-transmission. Pricing custom / platform fees. |
| **ACH + wallet** (no full bank account) | Moov (~$0.25 next-day / ~$0.40 same-day ACH; $500/mo minimum listed), Plaid Transfer, Dwolla | Pull from linked bank into a ledger/wallet. Moov wallets exist but are not a full consumer checking product. |
| **Stripe ACH** | Stripe | 0.8% capped $5 — simple but not ideal for “segregated checking.” |
| **Venmo destination** | Existing RB-001 | Locked v1 path; different UX (peer wallet vs dedicated savings). |

### 5. Feasibility summary

| Question | Verdict |
| --- | --- |
| Desired UX feasible? | **Yes** with BaaS or ACH+wallet |
| Feasible via public Acorns Partner API for push-to-deposit? | **Not clearly** — public surface looks read/data |
| Acorns fit on consumer cost? | **Weak** unless partner waives subscription |
| Next action | One outreach email to confirm unpublished partner funding product; then shortlist 2–3 rails vs stay Venmo-only |

---

## Decision shortlist (for RB-007 memo — fill after outreach)

1. **BaaS** (Column / Unit / Treasury Prime) — true segregated FDIC account; compliance-heavy (**XL** build)  
2. **ACH + wallet** (Moov / Plaid Transfer / Dwolla) — ledger hold without full consumer checking  
3. **Stay Venmo-only** longer — defer segregated hold; ship RB-001 and revisit  

_Pending: Acorns reply; partner pricing calls; compliance skim._

---

## Ready-to-send email draft (Acorns)

**To:** partner-api@acorns.com  
**From:** Jeremy Schrader / ReBuild  
**Reply-to:** jeremyrschrader@gmail.com  
**Subject:** Partner API / funding — can ReBuild initiate deposits into Acorns on user consent?

```
Hello Acorns Partner API team,

I’m Jeremy Schrader, founder of ReBuild (jeremyrschrader@gmail.com) — a recovery companion app with incentive-based savings. We’re evaluating whether Acorns could be a destination when a user taps “Move money” in our product: with the user’s consent, we’d like to programmatically initiate a one-time or recurring deposit from their linked bank into Acorns Checking or Invest.

We’re writing because public Partner API docs (https://developer.acorns.com/) emphasize OAuth and third-party access to user data. Before we invest in onboarding, we need to confirm capability and fit:

1. Can the Partner API (or any partner / BaaS-style program) initiate deposits or investments into a user’s Acorns Checking or Invest account when our app triggers a funding event — or is the API limited to read/data access?
2. Do recovery, fintech, or similar partners have funding or money-movement APIs beyond read-only data access?
3. What is the sandbox / onboarding path and typical timeline for a new partner?
4. Consumer cost is critical for our users: Acorns’ consumer subscription ($3 / $6 / $12 mo) is a high bar for people in recovery. Is there a partner arrangement with little or no subscription friction for end users, or a fee model borne by the partner instead?

Happy to jump on a short call. Thank you for clarifying whether Acorns is a viable funding destination for our “Move money” flow.

Best,
Jeremy Schrader
Founder, ReBuild
jeremyrschrader@gmail.com
```

---

## Changelog

| Date | Note |
| --- | --- |
| 2026-08-13 | Initial research capture from founder discovery; email draft added for RB-007 |
