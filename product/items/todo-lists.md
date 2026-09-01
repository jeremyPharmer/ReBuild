# To-do lists (first-class) — “bass ass to do list”

| Field | Value |
| --- | --- |
| ID | RB-014 |
| Rank | 3 |
| Priority | P0 |
| Status | Ready |
| Effort | L |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

Jeremy **loves to-do lists**. JeremyOS Home already has a **Today’s Build** checklist (morning/evening + weekly supports + one-off “provisions”), but it is not a first-class personal task system: no master list, no recurring cadence, no snooze-until, and naming still says Build / Provisions. Checklist leftovers only appear as a later email digest idea (RB-003), not as a core surface.

## Outcome

JeremyOS has a durable **Today’s Items** list Jeremy will use daily: personal tasks live on the same list as morning / supports / evening; he can add, complete, snooze, and recur; a **master to-do page** (possibly its own bottom nav tab) shows everything — without boiling into a generic productivity suite or email in v1.

## Scope (v1) — locked 2026-08-31

**One merged list**

- Personal tasks **merge into** Today’s Items alongside morning / recovery supports / evening (not a separate parallel list)
- Recovery **supports stay** on the same Today’s Items list for now
- Rename **“Today’s Build” → “Today’s Items”** on Home + morning (and any related copy)
- **Drop “Provisions” / provision language** entirely (UI + user-facing copy; eng may rename data types in a follow thin pass)

**Today’s Items behaviors**

- Add items to today’s list
- Complete / undo
- **Incomplete auto-rolls** to tomorrow (end of day / next calendar day)
- **Snooze:** quick snooze → tomorrow **and** snooze-until (date picker, Gmail-like)
- **Simple recurrence** only:
  - Daily
  - Weekly on chosen weekday(s)
  - Every N days
  - **Repeats on the first of the month** (monthly, day 1)
- Once done (recurring): **don’t show again until next due date**
- **Date-only** due (no time-of-day) — Product default
- **Edit + delete** in v1; archive later — Product default

**Master list**

- Dedicated **master to-do page**
- **Maybe its own bottom nav tab** — accepted direction (see Risks); may conflict with prior “no sixth nav tab” guidance and should coordinate with RB-012 rebrand / IA

**Per user**

- Each logged-in user gets their own list (standard multi-user) — Product default

**Explicitly not in v1**

- No email reminders or digests in this item (RB-002 / RB-003 later; RB-003 should consume this model when email ships)

## Out of scope / later

- Email reminders / open-list digest (RB-002, RB-003)
- Archive (edit + delete ship first)
- Time-of-day due / reminders
- Full calendar recurrence beyond the four v1 cadences (exceptions, RRULE soup, skip-next UI, calendar sync)
- Projects, tags, GTD systems, shared lists, assignees
- Moving supports off Today’s Items (leave for now; revisit later)
- Replacing journal or evening close with todos
- AI task breakdown

## Dependencies & risks

- **UX / nav:** Possible **new bottom nav tab** for master todos vs prior “no sixth nav tab” rule — accepted founder direction; flag for **UXUI + RB-012** (rebrand may rework chrome). Prefer one clear IA, not six crowded tabs by default — validate tab vs nested route at build.
- Extends / replaces **day provisions** model on Home `TodayRebuildPanel` + morning add flow — eng should evolve existing surface rather than invent a second checklist
- Auto-roll + snooze-until + recurrence need a clear date model (timezone-local calendar dates, same as journey `today`)
- Do not redesign close-the-day to force todos; morning/evening remain ritual entries on the merged list
- RB-003 / RB-002 consume open items later — keep task model reusable; do not block v1 on email

## Notes

- Intake **2026-08-29** founder: loves to-do lists. Rank **3** / **P0**.
- Intake **2026-08-31** founder: “bass ass to do list” + clarifying Qs → answers locked same day (merge list; all-but-email v1; master page ± nav tab; recurrence + first-of-month; auto-roll incompletes; snooze tomorrow + until; drop Provisions copy; supports stay). Product defaults applied for edit/delete, date-only, per-user lists.
- Effort **L** (merged list + recurrence set + snooze-until + auto-roll + master page + possible nav tab + copy sweep). Rank **unchanged** (3).
- Related: [RB-003](./daily-open-checklist-email.md), [RB-002](./email-integration.md), [RB-012](./rebrand-jeremyos.md) for nav/chrome; agenda/calendar events are [RB-023](./calendar-ical-google.md) (sits beside todos, does not replace them).
- Legacy surface at lock: Home eyebrow “Today’s Build”; morning “Provisions” / one-time provision add; `DayProvision` one-offs — all superseded by locked Scope above.
