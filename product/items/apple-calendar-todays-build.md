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

Read-only Apple / iCloud calendar events for **today** (and optionally near-term upcoming) appear under **Today’s Build** as things Jeremy needs to do / be on for that day — not only on a separate calendar page.

## Scope (v1)

- Connect Jeremy’s Apple / iCloud calendar via a **web-viable** path (likely iCloud CalDAV, signed-in calendar API, or ICS subscribe — spike chooses one)
- **Read-only** pull of **today’s** events into Today’s Build as “on calendar today / need to do” items (distinct from freeform todos)
- Optional: show a short upcoming window (e.g. next 1–2 days) if cheap; do not require a full week view
- Clear source labeling so calendar items are not confused with manual todos (RB-014)
- Refresh / re-sync that is good enough for a personal daily loop (manual refresh OK for v1)

## Out of scope / later

- Two-way sync; creating / editing / deleting events from JeremyOS
- Full calendar UI / month agenda product
- Android / Google Calendar as v1 (track separately if asked)
- Complex recurrence editing; invite RSVP; reminders push from Apple
- Dumping this into RB-014 to-do lists v1 (calendar sync stays **this** item)

## Dependencies & risks

- **Access path:** A web app cannot talk to iPhone **EventKit** directly. Likely options: **iCloud CalDAV**, Sign in with Apple + calendar provider API, or **ICS** subscribe URL. Spike must pick one before build.
- Auth / app-specific passwords, Apple rate limits, and private calendar permissions
- All-day vs timed events; time zone honesty for “today”
- Recurring event expansion without building a recurrence editor
- Similar external-connect pattern to [RB-002](./email-integration.md); do not block on Gmail

## Notes

- Intake **2026-08-31** founder personal-use ask — passes [RB-013](./personal-os-north-star.md) build filter.
- Rank **9** / **P1** — **Next / high personal OS**: after rebrand, north star, todos (RB-014), journal (+ photos), Gmail, podcast, and cameras; calendar feeds the same daily “what do I need to do” surface as todos but must not jump those Now items; Apple access path needs a thin spike.
- Separate from [RB-014](./todo-lists.md): that item’s out-of-scope already excludes “Recurring complex rules / calendar sync.” Cross-link kept there → this ID.
- ID is **RB-022** (RB-021 already claimed by journal photos).
