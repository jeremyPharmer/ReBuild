# Daily Puzzle on Home

| Field | Value |
| --- | --- |
| ID | RB-024 |
| Rank | 9 |
| Priority | P1 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product |

## Problem

Home is checklist / Move / Entertainment-heavy and lacks a small **daily cognitive ritual** Jeremy can return to. He asked for a simple brain game or puzzle on the Home Screen — calm, useful, not a casino or entertainment hub. Follow-up: he likes **crossword** because he can **chip at it during the day** (progressive / multi-session), not a 30-second one-shot.

## Outcome

Home shows one **daily puzzle** Jeremy can open, leave, and resume the same calendar day with **progress saved**. Clear “Solved” when complete. Fits an executive / recovery-safe tone — no casino, no Entertainment hub expansion.

## Scope (v1) — recommended default: Mini Crossword (chip-through-the-day)

- Compact Home block (one job): today’s **mini crossword** — small fixed grid (target **~5×5**) with **3–5 clues**
- One puzzle per calendar day (seeded by date)
- **Persist in-progress grid + answers** for the day so Jeremy can chip across sessions; mark Solved when complete
- Quiet success state (“Solved”) — no streaks-as-guilt, no coins, no ads, no casino framing
- Placement: Home, below primary Today / agenda work — not competing with todos
- Curated clue pack for v1 (hand-authored days; rotate) — not a full crossword CMS

## Out of scope / later

- Leaderboards, multiplayer, streaks monetization, or Treat/fund hooks
- Multiple puzzle types shipping at once
- Full newspaper crossword / NYT-scale grids or third-party embeds
- One-shot-only mechanics as the primary Home puzzle (unscramble / riddle / Simon) — see Notes “less preferred”
- Replacing podcast / recovery content (RB-005) or Entertainment demotion (RB-025)

## Dependencies & risks

- UXUI: expandable Home card that preserves grid state; calm, not arcade
- Content: clue + answer curation (avoid recovery triggers / junk slang); mini packs are the cost of crossword vs unscramble
- Persistence: day-keyed progress in existing store (`.data/db.json` / user state) — eng detail
- Do not expand Entertainment while this ships — Entertainment is parked ([RB-025](./park-home-entertainment.md))

## Notes

- Intake **2026-09-03** founder ask: simple daily brain game/puzzle on Home; demote Entertainment.
- Follow-up **2026-09-04:** prefers **crossword** for **chip-during-the-day** / multi-session solve; asked what else fits that pattern. Effort → **M**. Word Unscramble demoted from default.
- **Recommended v1:** Mini Crossword (~5×5, 3–5 clues, save progress) — effort **M**.
- **Progressive shortlist** (save progress, return later same day) — preferred class:

| Idea | Mechanic | Why it chips well | Effort | Home fit / risk |
| --- | --- | --- | --- | --- |
| **Mini Crossword** *(default)* | Small grid + 3–5 across/down clues; tap cell, enter letters | Natural multi-session; leave half-filled, finish later | M | Best founder fit; clue curation is the main cost |
| **Micro Number Place** | 4×4 or 6×6 sudoku-lite; fill cells over the day | Grid state is inherently progressive | M | Calm classic; less “wordy”; still needs daily grids |
| **Daily Cryptogram** | Short phrase as letter-substitution cipher; map letters over sessions | Partial alphabet maps save cleanly; chip a few letters at a time | S–M | Strong chip pattern; tone must stay adult/calm, not toy |
| **Mini Nonogram** | Tiny picross (e.g. 5×5); fill/cross cells from edge clues | Session-friendly painting of the grid | M | Satisfying progress bar feel; slightly more “game UI” risk |
| **Word Framework** | Intersecting blanks + small word bank; place words over the day | Like crossword-lite without writing clues | S–M | Lighter content than crossword; slightly less newspaper ritual |
| **Acrostic Quote (thin)** | Clue-words unlock letters of a short quote; fill quote over sessions | Quote fills gradually — clear mid-day progress | M | Nice payoff; two surfaces (clues + quote) = more chrome |
| **Cross-Sums (Mini Kakuro)** | Number-crossword cells with sum clues | Same chip rhythm as crossword with numbers | M | Distinct; less familiar; clue/grid authoring still non-trivial |

- **Also considered / less preferred for chip-at-day** (one-shot or weak resume):

| Idea | Why deprioritized |
| --- | --- |
| **Daily Word Unscramble** | ~30s one-shot; weak multi-session story |
| **Riddle of the Day** | Single answer; no progressive grid |
| **Pattern Pulse** | Short recall burst; arcade-adjacent; not chip-through-day |

- Passes RB-013 build filter (Jeremy asked). Rank **9** — after calendar Home agenda (RB-023), before podcast polish (RB-005) and lifestyle tools. Entertainment remains parked (RB-025).
