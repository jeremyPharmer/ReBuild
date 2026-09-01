# Calendar integration (iCal + work Google Calendar)

| Field | Value |
| --- | --- |
| ID | RB-023 |
| Rank | 8 |
| Priority | P1 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product |

## Problem

Jeremy wants his **personal iCal** events and **work Google Calendar** tied into JeremyOS. Today there is only an engineering stub (`WORK_CALENDAR_ICS_URL` → empty events; `GET /api/calendar/work`) with **no UI consumer**. Without a thin agenda surface, the EA / personal OS cannot answer “what’s on today?” alongside todos and rituals. This is **not** email (RB-002) and **not** the journal month browse calendar (RB-022).

## Outcome

JeremyOS can **read** personal + work calendars via **ICS feeds** for a given day and show a thin **today’s agenda** (default: Home) so Jeremy sees what’s coming without opening Apple Calendar or Google Calendar.

## Scope (v1)

- **Read-only ICS feeds:** personal iCal secret URL + Google Calendar “secret address in iCal format” (or public ICS) — matches existing stub direction (`WORK_CALENDAR_ICS_URL`; may extend to a second personal URL or a combined config)
- **Fetch + parse ICS** for a selected calendar day (timezone-aware using existing profile timezone)
- **Surface today’s events** in an EA-useful place — **default: Home “today” agenda** (morning ritual / dedicated page deferred; open if Jeremy prefers otherwise)
- Wire/finish the existing stub + API so `connected` + `events` are honest when URLs are set
- Config v1 lean: **env and/or thin Settings** for ICS URL(s) — prefer Settings if cheap; env-only acceptable for first ship

## Out of scope / later

- Full **OAuth** Google Calendar API
- Write-back / create / edit events; two-way sync
- Outlook deep integration
- Full **calendar month UI** as a product surface (distinct from journal browse)
- Replacing Journey, todos (RB-014), or email (RB-002)
- Conflating with **RB-022** journal month calendar (browse past journal days — unrelated)

## Dependencies & risks

- Stub already exists: `src/lib/work-calendar.ts`, `GET /api/calendar/work` — ICS parse deferred; **no UI** consumes the API yet
- Code comment historically mislabeled this as “RB-002 / calendar integration” — **RB-002 is Email/Gmail only**; do not overload that ID (eng fix when implementing)
- Secret ICS URLs are sensitive (treat like credentials in env/settings)
- ICS fidelity varies (all-day, recurring expansion, cancelled instances) — keep v1 “good enough for today”
- Passes [RB-013](./personal-os-north-star.md) build filter: Jeremy asked to tie calendars in

## Open questions (do not block intake)

- One **combined** agenda vs separate **personal** + **work** feeds/sections
- Where to show: **Home** (default) vs morning ritual vs dedicated page
- **Env-only** vs Settings UI for ICS URLs
- Timezone edge cases beyond profile timezone

## Notes

- Intake **2026-09-01** founder: “Let’s inspect tying in my iCal events and my work Google Calendar.” Inspect/intake only — Status **Backlog** (not Ready).
- **Rank 8** — immediately after email (RB-002, rank 7) in the EA plumbing cluster; does **not** jump ahead of rebrand / north star / todos / journal (ranks 1–6).
- **Priority P1** (not P0): core EA-adjacent like email, but must not displace journal/todo P0 focus; rank still places it next in the EA cluster after Gmail.
- Effort **M**: ICS parse + config + thin Home agenda surface.
- Milestone **v1.x** — useful personal OS, not Day-1 critical path.
- Related: [RB-002](./email-integration.md) (email ≠ calendar), [RB-013](./personal-os-north-star.md), [RB-014](./todo-lists.md) (agenda sits beside todos, doesn’t replace them), [RB-022](./journal-edit-star-calendar.md) (journal month UI only — unrelated).
