# To-do lists (first-class) — “bass ass to do list”

| Field | Value |
| --- | --- |
| ID | RB-014 |
| Rank | 3 |
| Priority | P0 |
| Status | Backlog |
| Effort | TBD |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

**Scope lock:** **Not locked.** Founder asked clarifying questions before we commit v1. Rank stays **3 / P0** (already elevated); do not expand Scope below until answers land.

## Problem

Jeremy **loves to-do lists**. JeremyOS Home already has a **Today’s Build** checklist (morning/evening + weekly supports + one-off “provisions”), but it is not a first-class personal task system: no master list, no recurring cadence, no snooze-to-tomorrow, and rename toward personal “items” is unfinished. Checklist leftovers only appear as a later email digest idea (RB-003), not as a core surface.

## Outcome

JeremyOS has a durable **Daily List / Today’s Items** Jeremy will use: add tasks, see what’s due today, complete/snooze, optionally recur — without boiling into a generic productivity suite.

## Prior tentative scope (pre–2026-08-31; not superseded until clarified)

- First-class to-do surface (placement TBD: Home section or dedicated lightweight view — **no sixth nav tab** unless existing tabs are reworked under rebrand)
- Create / complete / reopen items; persist per user
- Clear “open vs done” list; optional due-date **only if** needed for v1 (default: none)
- Enough structure that RB-003 can later email open items (reuse model; do not block on email)

## Candidate v1 (tentative — awaiting Jeremy)

Founder ask (2026-08-31), **not decisions**:

- Rename **“Today’s Build” → “Today’s Items”** (Home + morning surfaces)
- Add items to the **Daily List** (today’s surface)
- Section to create tasks that can **recur on a cadence** and appear in the list
- **Snooze** an item to tomorrow
- Choose if it repeats, how often, and at what frequency
- Once done, **don’t show again until next due** (recurring)
- Basic task functions that surface in the list for today
- A place to see the **master list**
- Possibly **email reminders** for certain items (likely later / depends on RB-002)

### Candidate later (keep out of thin v1 unless Jeremy insists)

- Per-item email reminders (needs RB-002)
- Complex recurrence (exceptions, skip next, calendar sync)
- Projects / tags / GTD / shared lists
- Replacing journal or evening close with todos

## Out of scope / later (prior defaults — revisit after answers)

- Projects, tags, GTD systems, shared lists, assignees
- Recurring complex rules / calendar sync *(simple cadence may move into v1 if Jeremy prioritizes it)*
- Replacing journal or evening close with todos
- AI task breakdown

## Dependencies & risks

- **Today’s Build / day provisions** already exist — expand vs replace vs sit beside recovery supports is an open product call (see Open Questions)
- Placement vs existing Home daily loop — prefer one clear home so Jeremy knows where to look
- Do not redesign close-the-day to force todos; additive personal tool
- Email reminders / digests pair with RB-002 / RB-003; do not block thin list v1 on Gmail unless Jeremy makes reminders P0-for-v1
- Recurrence + snooze + master list push effort above the old **M** estimate → **TBD** until scope cut

## Open Questions

### Must-answer-for-v1

1. **One list or two?** Does the new to-do system **replace** one-off morning “provisions,” **merge into** Today’s Build / Items alongside morning / supports / evening, or live as a **separate** personal task layer beside recovery supports?
2. **What ships in v1 vs next?** Minimum cut among: rename Today’s Items · add-to-today · complete/undo · snooze → tomorrow · simple recurrence · master list · email reminders?
3. **Master list home:** Where does Jeremy manage all tasks — expand Home only, a lightweight `/todos` (or similar) page, or morning-only create + Home today view?
4. **Recurrence v1 shape:** What cadences are enough (e.g. daily / weekly on chosen weekday(s) / every N days) vs “I’ll configure anything later”?
5. **Done + recurring:** Confirm: complete hides until next due; does **incomplete** roll to tomorrow automatically, stay stuck on that day, or only move if snoozed?
6. **Snooze:** Tomorrow only for v1, or also pick a date / “next weekday”?
7. **Email in v1?** Per-item reminders now (blocks on RB-002), end-of-day open-list digest only (RB-003 later), or **no email in todo v1**?

### Nice-to-clarify

8. Rename only the eyebrow **“Today’s Build” → “Today’s Items”**, or also drop “Provisions” / “provision” language on morning add?
9. Should recovery **supports** stay checkable on the same Today’s Items list, or move off that list over time?
10. Delete / archive / edit title — required in v1?
11. Time-of-day or just date-based due?
12. Multi-user: todos are **Jeremy-only** personal data (default) or any logged-in user gets their own list?

## Notes

- Intake **2026-08-29** founder: loves to-do lists. Rank **3** / **P0** under JeremyOS — ahead of recovery-catalog polish and money-rail expansion.
- Intake **2026-08-31** founder: “bass ass to do list” — Daily List add, rename Today’s Items, recurring cadence section, snooze tomorrow, master list, done-until-next-due, possibly email; **explicitly asked clarifying questions before lock**. Effort set **TBD**; Scope not expanded as committed.
- Related: [RB-003](./daily-open-checklist-email.md) becomes a consumer of this list once email exists; update RB-003 when todo model lands. [RB-002](./email-integration.md) for any reminder channel.
- Current product surface (as of intake): Home `TodayRebuildPanel` eyebrow **“Today’s Build”**; morning page same label + **Provisions** + “Add a one time provision for today”; `DayProvision` = one-off label/completed for a date; supports + morning/evening + skips (“Not today”) compose the daily checklist. No master list, recurrence, or snooze.
- Open (older): does “to-do” replace or sit beside today’s support checklist language? Default recommendation if Jeremy says “you decide”: **beside** — supports stay recovery provisions; todos are personal wants/tasks — **recommendation only until answered**.
