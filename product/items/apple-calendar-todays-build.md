# Apple Calendar → Today’s Build

| Field | Value |
| --- | --- |
| ID | RB-022 |
| Rank | 9 |
| Priority | P1 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product |

## Problem

Jeremy’s day lives partly on his **Apple iPhone calendar**. Those events do not show up under **Today’s Build**, so JeremyOS misses a real “what do I need to do today” signal he already maintains elsewhere. Founder asked to connect Apple Calendar and surface those items on that day’s Today’s Build.

## Outcome

Apple / iCloud calendar events for **today** (and optionally near-term upcoming) appear under **Today’s Build** as things Jeremy needs to do / be on for that day — not only on a separate calendar page. He can **cross off / complete** that day’s occurrence **locally in JeremyOS** without requiring a write-back to Apple Calendar in v1.

## Scope (v1)

- Connect Jeremy’s Apple / iCloud calendar via **iCloud CalDAV** (preferred web-viable path; spike confirms details)
- **Poll**-based sync of **today’s** events into Today’s Build as “on calendar today / need to do” items (distinct from freeform todos) — at least once/day; also on Today’s Build load / morning open / manual refresh as useful
- **Local complete / cross-off** for that day’s occurrence: persist done state in JeremyOS DB; incomplete items stay on the day’s list until crossed off or the day rolls
- Optional: show a short upcoming window (e.g. next 1–2 days) if cheap; do not require a full week view
- Clear source labeling so calendar items are not confused with manual todos (RB-014)
- Surface typical event fields (see Feasibility below)

## Out of scope / later

- **Native Apple calendar webhooks / push** — Apple does not offer these to third-party web apps (CalDAV-only)
- Writing completion / STATUS back into Apple Calendar; creating / editing / deleting events from JeremyOS (two-way write)
- Full calendar UI / month agenda product
- Android / Google Calendar as v1 (track separately if asked)
- Complex recurrence editing; invite RSVP
- Elevating SMS (RB-004) for daily calendar nudges — optional later via JeremyOS-owned channels (email digest RB-003, SMS later, or browser/PWA notification later)
- Dumping this into RB-014 to-do lists v1 (calendar sync stays **this** item)

## Feasibility / answers (founder follow-up 2026-08-31)

### Webhooks from Apple?

**No.** iCloud Calendar is **CalDAV-only**. Apple does **not** provide calendar webhooks / push change notifications to third-party web apps. Change detection = **polling** (ideally CalDAV `sync-collection` / sync tokens). Third-party wrappers that advertise “webhooks” are still polling Apple underneath — not native Apple push.

### “Phone every day?”

Two readings:

1. **Daily sync from iPhone / iCloud calendar:** **Yes.** Poll at least once/day (and more often if useful: morning open, Today’s Build load, manual refresh). Good enough for personal OS without Apple webhooks.
2. **Call / SMS / push the phone every day about calendar items:** Not via native Apple calendar webhooks. A daily nudge would be **JeremyOS-owned** (email digest [RB-003](./daily-open-checklist-email.md), SMS [RB-004](./sms-integration.md) later, or browser/PWA notification later). Do **not** elevate SMS for this item.

### Cross them off

**v1:** Support **local complete / cross-off in JeremyOS** for that day’s occurrence (persist done state in our DB). Do **not** require writing completion back into Apple Calendar for v1 (calendar events aren’t Apple Reminders; two-way STATUS write is later/optional). Incomplete items stay on the day’s list until crossed off or the day rolls.

### What details can we get?

Typical iCalendar / CalDAV fields:

**v1 show (recommended):**

| Field | Source |
| --- | --- |
| Title | `SUMMARY` |
| Start / end time (or all-day) | `DTSTART` / `DTEND` (or `DURATION`) |
| Location (if present) | `LOCATION` |
| Calendar name / which calendar | CalDAV calendar collection (multi-calendar) |
| Recurring vs one-off | Flag only — do not edit `RRULE` |

**Available but optional / later:**

- Notes / description (`DESCRIPTION`)
- URL
- Attendees / organizer
- Alarms / reminders
- Busy/free / status
- Time zone (keep honest for “today”; full TZ UI later)

## Dependencies & risks

- **Access path:** A web app cannot talk to iPhone **EventKit** directly. Primary path: **iCloud CalDAV** + polling (`sync-collection` / sync tokens). ICS subscribe is a thinner fallback if CalDAV auth is painful.
- Auth / app-specific passwords, Apple rate limits, and private calendar permissions
- All-day vs timed events; time zone honesty for “today”
- Recurring event expansion without building a recurrence editor
- Local done-state keyed to event UID + occurrence date so re-sync does not resurrect crossed-off items
- Similar external-connect pattern to [RB-002](./email-integration.md); do not block on Gmail
- Effort stays **M** (connect spike + poll + local cross-off); no rank change

## Notes

- Intake **2026-08-31** founder personal-use ask — passes [RB-013](./personal-os-north-star.md) build filter.
- Rank **9** / **P1** — **Next / high personal OS**: after rebrand, north star, todos (RB-014), journal (+ photos), Gmail, podcast, and cameras; calendar feeds the same daily “what do I need to do” surface as todos but must not jump those Now items; Apple access path needs a thin spike.
- Separate from [RB-014](./todo-lists.md): that item’s out-of-scope already excludes “Recurring complex rules / calendar sync.” Cross-link kept there → this ID.
- ID is **RB-022** (RB-021 already claimed by journal photos).
- **Founder follow-up 2026-08-31:** no Apple webhooks (poll CalDAV); daily sync yes / phone nudge = JeremyOS-owned later; local cross-off in v1 (no Apple write-back); document v1 vs later field list. Rank/priority unchanged.
