# Accounts + trail onboarding (multi-user)

| Field | Value |
| --- | --- |
| ID | RB-007 |
| Rank | 1 |
| Priority | P0 |
| Status | In Progress |
| Effort | XL |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

ReBuild is single-tenant with no auth (“open the link and go”). That blocks a real multi-user product, privacy on shared devices, and admin visibility into who signed up and who is still active. Founder prod data must survive the shift.

## Outcome

Every visitor must create an account before using the app. Onboarding is one continuous **trail-themed** progress flow. Users sign in with email + password; optional synced 4-digit PIN for quick access; optional “Remember this device” for persistent session. Admin (allowlisted emails) sees users’ created-at and last login from a Settings card. Existing prod journey migrates onto the first admin account.

## Scope (v1)

### Access & identity

- Hard gate: no app use without an account
- Email + password create / login
- Forgot password → email reset link only (delivery depends on RB-002; can stub until email ships)
- Optional **4-digit PIN**, synced to the user account (quick access on any device after account exists)
- Optional **Remember this device** (long-lived session; today’s “always in” feel on that device)
- Required profile: **display name**, **gender**, **state** (fixed option sets below)
- Admin = **specific email allowlist** (not “first user wins”)
  - **v1 allowlist (founder only):** `jeremyrschrader@gmail.com`
  - Expand the list later without changing the admin UX pattern
- Migrate current **prod** journey/state onto the first admin account; retain history

### Trail onboarding (one continuous flow)

Progress UI consistent with trail / journey language. Suggested steps:

1. Create account (email, password, confirm)
2. About you (display name, gender, state)
3. Device unlock (set PIN and/or Remember this device — both optional but offered here)
4. Weekly supports — canned inspiration chips **plus** custom; set **frequency/target** per support
5. Money — historical daily spend; recommend **70% Treat / 30% Future** (editable); no bank linking
6. Seed wishlist — add rewards **exactly like today’s reward create** (couple to start; same fields/rules as v1 Settings)
7. Enter Home / Day 1

### Admin (Settings)

- Card visible **only** to allowlisted admin emails
- Opens user list: email (and/or display name), **account created**, **last login**
- **Last login** updates on any successful access that proves the user is active: password login, PIN unlock, or remember-me session resume (so admin can see active users)

### Storage

- Persist per-user account + profile + full journey/fund state (replace single shared `db.json` tenant model)
- **No images** at account create in v1 (reward photos remain whatever v1 already supports later in-app)

## Out of scope / later

- In-app product walkthrough / how-to tour
- Bank / Plaid linking
- Avatars or account-create image uploads
- Full admin console (balances, supports detail, impersonation, etc.)
- OAuth / social login
- SMS recovery codes
- Changing the locked fund model beyond spend + 70/30 already in product

## Dependencies & risks

- **RB-002 (email)** required for real forgot-password delivery; reset UX can ship gated/stubbed until then
- **RB-001 (Venmo)** benefits from per-user identity; accounts should land before or with payment identity work
- Prod data migration must be one-shot and verified (founder true-source)
- PIN synced across devices is a security/privacy tradeoff (account-level secret, not device-local); treat as quick-access, not a substitute for password on sensitive changes
- Supersedes `PRODUCT_DECISIONS.md` “No auth V1; honor system” when this ships — honor-system reclaim can remain until verification exists
- Effort **XL**: auth sessions, multi-user store, onboarding UX, admin surface, migration

## Notes

- Intake dialog 2026-08-13 (cloud agent / Head of Product). Rank **1** — platform prerequisite for multi-user; renumbers prior P0s down.
- Canned support inspiration (examples, not final copy): walk, gym, meditate, recovery content, meetings, medication — plus custom.
- **Gender (required, fixed):** Woman · Man · Non-binary · Prefer not to say
- **State (required, fixed):** US states + DC (dropdown)
- Admin confirm 2026-08-13: allowlist = founder email only for now (`jeremyrschrader@gmail.com`).
- Money stays as today: daily spend drives reclaim; Future/Treat split defaults 30/70 per `FUND_MODEL.md`.
- Walkthrough explicitly deferred past v1 of this item.
- Prod Hx migration: snapshot/attach existing prod `db.json` to admin account when RB-007 ships (backup-only is available before build).
