# Calendar integration (iCal + work Google Calendar)

| Field | Value |
| --- | --- |
| ID | RB-023 |
| Rank | 8 |
| Priority | P1 |
| Status | In Progress |
| Effort | M |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product |

## Problem

Jeremy wants his **personal iCal** events and **work Google Calendar** tied into JeremyOS. Today there is only an engineering stub (`WORK_CALENDAR_ICS_URL` → empty events; `GET /api/calendar/work`) with **no UI consumer**. Without a thin agenda surface, the EA / personal OS cannot answer “what’s on today?” alongside todos and rituals. This is **not** email (RB-002) and **not** the journal month browse calendar (RB-022).

## Outcome

JeremyOS can **read** personal + work calendars via **ICS feeds** for a given day and show a thin **today’s agenda** on **Home** so Jeremy sees what’s coming without opening Apple Calendar or Google Calendar.

## Scope (v1)

**Locked 2026-09-01 (founder follow-up):**

- **One combined agenda** — single “today’s events” list; not separate personal/work sections
- **Surface: Home** — today’s agenda on Home (morning ritual / dedicated page deferred)
- **Config: Settings** — Apple iCal paste + **Google Calendar OAuth connect** (primary for Workspace free/busy ICS limits); optional Google secret iCal fallback
- **Read-only** — fetch events for a selected calendar day (timezone-aware using profile timezone)
- Wire API so `connected` + `events` are honest when URLs or OAuth are set

**Added 2026-09-01:** Google OAuth (`calendar.readonly`) so work meeting titles appear even when org ICS feeds redact to “Busy”.

## Out of scope / later

- Write-back / create / edit events; two-way sync
- Outlook deep integration
- Full **calendar month UI** as a product surface (distinct from journal browse)
- Replacing Journey, todos (RB-014), or email (RB-002)
- Conflating with **RB-022** journal month calendar (browse past journal days — unrelated)
- Separate personal vs work agenda sections (locked: combined)

## Dependencies & risks

- Stub already exists: `src/lib/work-calendar.ts`, `GET /api/calendar/work` — ICS parse deferred; **no UI** consumes the API yet
- Code comment historically mislabeled this as “RB-002 / calendar integration” — **RB-002 is Email/Gmail only**; do not overload that ID (eng fix when implementing)
- Secret ICS URLs are sensitive (treat like credentials in Settings)
- ICS fidelity varies (all-day, recurring expansion, cancelled instances) — keep v1 “good enough for today”
- Passes [RB-013](./personal-os-north-star.md) build filter: Jeremy asked to tie calendars in

## Open questions (do not block build)

- Timezone edge cases beyond profile timezone (v1 uses profile timezone + floating DATE handling)

## Notes

- Intake **2026-09-01** founder: “Let’s inspect tying in my iCal events and my work Google Calendar.”
- Follow-up **2026-09-01** locked: combined agenda; Home surface; Settings paste for secret ICS subscribe links (not env-only product path; not todos); Status → **In Progress** (go get Apple iCal).
- Follow-up **2026-09-01** founder answers: (1) one **combined** agenda; (2) **Home** surface; (3) paste secret Apple/Google ICS links in **Settings** (not env jargon; calendar events ≠ tasks). Build in progress.
- **Rank 8** — immediately after email (RB-002, rank 7) in the EA plumbing cluster; does **not** jump ahead of rebrand / north star / todos / journal (ranks 1–6).
- **Priority P1** (not P0): core EA-adjacent like email, but must not displace journal/todo P0 focus; rank still places it next in the EA cluster after Gmail.
- Effort **M**: ICS parse + Settings URL config + thin Home combined agenda.
- Milestone **v1.x** — useful personal OS, not Day-1 critical path.
- Related: [RB-002](./email-integration.md) (email ≠ calendar), [RB-013](./personal-os-north-star.md), [RB-014](./todo-lists.md) (agenda sits beside todos, doesn’t replace them), [RB-022](./journal-edit-star-calendar.md) (journal month UI only — unrelated).
