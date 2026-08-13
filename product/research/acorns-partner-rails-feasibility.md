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

### 5. Venmo “Move money” auto-pull (founder follow-up)

**Can ReBuild make Venmo pull from the user’s assigned checking when they tap Move money?**

**No — not via any official partner API.**

| Mechanism | Who controls it | Triggered by ReBuild Move money? |
| --- | --- | --- |
| Venmo **Add Money** (bank → Venmo balance) | User in Venmo app | No |
| Venmo **Auto Reload** / **Schedule** | User in Venmo app | No (threshold/schedule only; not amount-synced to ReBuild) |
| PayPal **Payouts → Venmo** | ReBuild business PayPal → user Venmo | Yes, but money comes **from ReBuild**, not the user’s checking |
| Unofficial Venmo private APIs | Scripts / reverse engineering | Technically some exist; **ToS / ban risk — do not ship** |

So with Venmo as the *destination hold*, the user still has to fund Venmo themselves (or rely on Venmo’s own Auto Reload, which won’t match Move money amounts). True “tap Move money → debit my checking into the hold” needs **BaaS or ACH+wallet** (or similar), not Venmo as the pull rail.

### 6. Feasibility summary

| Question | Verdict |
| --- | --- |
| Desired UX feasible? | **Yes** with BaaS or ACH+wallet |
| Feasible via public Acorns Partner API for push-to-deposit? | **Not clearly** — public surface looks read/data |
| Acorns fit on consumer cost? | **Weak** unless partner waives subscription |
| Venmo auto-pull checking → Venmo on Move money? | **No** official API; user funds Venmo manually (or in-app Auto Reload) |
| Next action | One outreach email to confirm unpublished partner funding product; then shortlist 2–3 rails vs stay Venmo-only (honor-system + deep-link) |

---

## BaaS explained + 1-tap Move money options (founder follow-up)

### What BaaS is

**Banking-as-a-Service** = a partner (and usually a **sponsor bank**) that lets ReBuild offer **real bank accounts** via API — open an FDIC-insured checking/savings for each user, then ACH-debit their external checking into that account when they tap Move money.

Rough stack for 1-tap:

1. **One-time setup:** KYC identity verify → open ReBuild savings/checking at partner bank → link external funding bank (Plaid or micro-deposits) → user authorizes ACH debits  
2. **Each Move money:** ReBuild API call → ACH debit $X from linked checking → credit lands in their ReBuild-held account → app ledger updates when webhook says settled  

User never opens Venmo/Acorns. Consumer fee can be **$0** if ReBuild absorbs platform/ACH cost.

### Is BaaS viable for ReBuild?

**Technically yes. Operationally/compliance-wise: heavy for a V1 recovery app.**

| Dimension | Reality check |
| --- | --- |
| **1-tap UX** | Yes — after setup, Move money can be one confirmed tap |
| **Consumer cost** | Can be $0 (platform pays ACH ~$0.25–$0.50 + platform fees) |
| **What user gets** | Real FDIC account (or branded deposit) — closest to “segmented checking that sits” |
| **Setup burden on user** | KYC (SSN/ID), bank link, ACH authorization — not free of friction, but once |
| **Cost to ReBuild** | Often **$1k–$10k+/mo** platform floors (vendor-dependent; Column more usage-based; Unit/Treasury Prime sales-negotiated) + ACH + KYC per user + possible deposit reserves |
| **Compliance** | Sponsor bank + KYC/AML/monitoring. Holding user balances can trigger **money-transmitter / FinCEN** questions — need counsel; BaaS does not auto-waive all licenses |
| **Calendar** | Not a weekend feature: sales + bank underwriting + compliance review + build commonly **weeks to months** before first live ACH |
| **Risk** | Sponsor-bank churn (industry has had high-profile BaaS failures); program can be killed by the bank |

**Verdict:** Viable as a **later real-money product**, not as the next ship behind today’s ledger. Best fit if the product *must* be “my ReBuild savings account,” not “I parked it in Venmo.”

### Providers (directional)

| Provider | Model | Notes for ReBuild |
| --- | --- | --- |
| **Column** | Chartered platform bank + APIs | Create accounts + ACH; public ACH ~$0.25; bring your own KYC; more “bank-direct” |
| **Unit** | Full-stack BaaS + sponsor banks | Faster path for non-bank teams; compliance tooling bundled; platform minimums common |
| **Treasury Prime** | API + choose sponsor bank | More control / bank relationship; sales pricing |

### All solutions for true 1-tap (debit user’s checking → hold)

| # | Solution | 1-tap? | Consumer $ | Hold type | Viable now? |
| --- | --- | --- | --- | --- | --- |
| **A** | **ACH + wallet** (Moov, Plaid Transfer, Dwolla) | Yes after bank link + auth | $0 possible | In-app wallet / ledger at licensed partner — **not** a full consumer checking UI | **Best near-term path to 1-tap** — lighter than full BaaS |
| **B** | **BaaS deposit account** (Column / Unit / Treasury Prime) | Yes after KYC + bank link | $0 possible | Real FDIC checking/savings | **Viable later** — right product shape, heavy ops |
| **C** | **Stripe ACH** into Stripe balance/Connect | Possible | $0 (you eat 0.8% capped $5) | Processor balance, not “my savings account” | Viable if you already live on Stripe; weak “segmented account” story |
| **D** | **Venmo as hold** | **No** | $0 | Peer wallet user funds themselves | Keep as **honor-system / deep-link** until A or B |
| **E** | **Acorns** | Unlikely via Partner API | $3–12/mo | Invest/checking inside Acorns | Weak unless unpublished partner funding + fee waiver |
| **F** | **Manual forever** | No | $0 | Whatever user chooses | Current V1 truth |

### Recommended sequencing for 1-tap

1. **Ship now:** honor-system Move money + clear “transfer $X to your hold” copy (Venmo deep-link if useful).  
2. **If 1-tap is the next money bet:** start vendor talks on **ACH + wallet (Moov / Plaid Transfer / Dwolla)** — closest to 1-tap without standing up a full bank program.  
3. **If the brand promise is “ReBuild checking/savings”:** pursue **BaaS** as a dedicated program (counsel + sales), not as a side feature.  
4. Do **not** plan on Venmo or Acorns for partner-triggered bank→balance pulls.

### Decision shortlist (for RB-007 memo — fill after outreach)

1. **ACH + wallet** (Moov / Plaid Transfer / Dwolla) — preferred **near-term 1-tap** candidate  
2. **BaaS** (Column / Unit / Treasury Prime) — preferred **true segregated account** candidate (later / XL)  
3. **Stay Venmo honor-system** — no 1-tap pull; lowest cost/compliance  

_Pending: Acorns reply; Moov/Plaid/Dwolla + one BaaS sales call; compliance skim with counsel._

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
| 2026-08-13 | Clarified Venmo cannot be partner-triggered to Add Money from checking on Move money |
| 2026-08-13 | Expanded BaaS explanation + 1-tap options matrix (ACH+wallet vs BaaS vs Venmo) |
