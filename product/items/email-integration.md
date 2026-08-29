# Email integration

| Field | Value |
| --- | --- |
| ID | RB-002 |
| Rank | 6 |
| Priority | P0 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

JeremyOS needs a reliable email channel for skills Jeremy actually wants (reminders, digests, account notices). Without it, daily open-checklist email (RB-003) and forgot-password delivery stay blocked. Founder **likes email skills** — elevate under the personal-OS pivot.

## Outcome

JeremyOS can send transactional and product emails to Jeremy’s authenticated address, with deliverability basics and preference controls.

## Scope (v1 of this item)

- Capture / verify user email
- Send transactional emails via a provider
- Basic templates and unsubscribe / preference hook
- Enough surface area to power RB-003 (daily open-checklist email)

## Out of scope / later

- Marketing campaigns / drip sequences
- Rich HTML design system polish beyond usable templates
- SMS (see RB-004)

## Dependencies & risks

- Provider choice (SendGrid, SES, Resend, etc.)
- Deliverability and spam compliance
- Required before RB-003 can go live

## Notes

- Added 2026-08-10 as future backlog; renumbered when RB-005 / RB-007 shifted ranks; **2026-08-18** shifted when RB-009 inserted; **2026-08-21** rank **8** when RB-011 took rank 2.
- Platform enabler for daily end-of-day checklist email (RB-003) and **forgot-password delivery** for RB-007.
- **2026-08-29 JeremyOS pivot:** elevated to rank **5** / **P0** (was 4; bumped when RB-016 entered). Founder likes email skills; personal OS ships what Jeremy will use — ahead of money-rail and generic recovery polish.
- **2026-08-29 RB-017:** renumbered to rank **6** (craving-cut item inserted at 3).
