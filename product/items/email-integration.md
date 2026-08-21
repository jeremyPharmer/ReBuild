# Email integration

| Field | Value |
| --- | --- |
| ID | RB-002 |
| Rank | 8 |
| Priority | P1 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | later |
| Owner | Product |

## Problem

ReBuild needs a reliable way to reach users by email for reminders, digests, and account-related notices. Without a shared email channel, features like the end-of-day open-checklist digest cannot ship.

## Outcome

The product can send transactional and product emails to the user (authenticated address), with deliverability basics and preference controls.

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
- Still behind accounts (RB-007), Venmo (RB-001), recovery content (RB-005), fund buckets (RB-006), and recovery patterns (RB-009).
