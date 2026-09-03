# Daily Puzzle on Home

| Field | Value |
| --- | --- |
| ID | RB-024 |
| Rank | 9 |
| Priority | P1 |
| Status | Backlog |
| Effort | S |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product |

## Problem

Home is checklist / Move / Entertainment-heavy and lacks a small **daily cognitive ritual** Jeremy can finish in under a minute. He asked for a simple brain game or puzzle he can solve daily on the Home Screen — calm, useful, not a casino or entertainment hub.

## Outcome

Home shows one **daily puzzle** with a clear solve state for the calendar day. Jeremy can finish it as a light morning (or anytime) brain stretch without leaving JeremyOS or opening a separate games app.

## Scope (v1) — recommended default: Daily Word Unscramble

- Compact Home block (one job): today’s scrambled word + answer input + Check
- One puzzle per calendar day (seeded by date); solved state persists for that day
- Curated word bank (dozens is enough; rotate by day-of-year)
- Quiet success state (“Solved”) — no streaks-as-guilt, no coins, no ads, no casino framing
- Placement: Home, below primary Today / agenda work — not competing with todos

## Out of scope / later

- Leaderboards, multiplayer, streaks monetization, or Treat/fund hooks
- Multiple puzzle types shipping at once
- Full crossword / sudoku engines or third-party embeds
- Replacing podcast / recovery content (RB-005) or Entertainment demotion (RB-025)

## Dependencies & risks

- UXUI: thin Home card; keep tone executive / recovery-safe (calm, not arcade)
- Content: word bank curation (avoid recovery triggers / junk slang)
- Do not expand Entertainment while this ships — Entertainment is parked ([RB-025](./park-home-entertainment.md))

## Notes

- Intake **2026-09-03** founder ask: simple daily brain game/puzzle on Home; give a few ideas; demote Entertainment.
- **Recommended v1:** Daily Word Unscramble (effort **S**).
- Shortlist considered (pick one for eng; alternatives stay parked):

| Idea | Mechanic | Effort | Fit |
| --- | --- | --- | --- |
| **Daily Word Unscramble** *(default)* | Unscramble one curated word keyed to the date; check + solved | S | 30s Home ritual; clear win; thin content |
| **Riddle of the Day** | One short logic/lateral riddle; multiple choice or short answer + reveal | XS–S | Quietest; almost no UI chrome |
| **Micro Number Place** | Tiny 4×4 sudoku-lite with one daily grid | M | Classic puzzle feel; more eng |
| **3-Clue Mini Crossword** | Fixed small grid + 3–5 daily clues | M | Newspaper ritual; content heavier |
| **Pattern Pulse** | Brief tap-sequence recall (Simon-lite), daily seed | S | Brain warm-up; keep UI calm to avoid “game hub” vibe |

- Passes RB-013 build filter (Jeremy asked). Rank **9** — after calendar Home agenda (RB-023), before podcast polish (RB-005) and lifestyle tools.
