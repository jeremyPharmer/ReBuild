# Email integration

| Field | Value |
| --- | --- |
| ID | RB-002 |
| Rank | 5 |
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

- Added 2026-08-10 as future backlog; renumbered to rank **3** when RB-005 (recovery podcasts) took rank 2.
- Platform enabler for daily end-of-day checklist email (RB-003).
- Still behind Venmo (RB-001) and recovery content podcasts (RB-005).
