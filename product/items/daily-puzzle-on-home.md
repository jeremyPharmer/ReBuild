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

Home is checklist / Move / Entertainment-heavy and lacks a small **daily cognitive ritual** Jeremy can return to. He asked for a simple brain game or puzzle on the Home Screen — calm, useful, not a casino or entertainment hub. Follow-ups: he likes **crossword** because he can **chip at it during the day** (progressive / multi-session); he wants the puzzle to **replace** the shipped **On Air / Today’s Entertainment** Home slot (`TodaysEntertainmentCard`).

## Outcome

Home’s former Entertainment / On Air slot is a **5×5 mini crossword** Jeremy can open, leave, and resume the same calendar day with **progress saved**. Clear “Solved” when complete. A **very simple lower-banner progress readout** shows started count as `n/XXX` plus **percent finish**. Executive / recovery-safe tone — no casino, no Entertainment hub expansion.

## Scope (v1) — locked: 5×5 Mini Crossword (replaces On Air)

### Locked (founder 2026-09-04)

- **Grid:** **5×5** mini crossword (not ~7×7); about **3–5 clues**
- **Placement:** **Replaces** On Air / Today’s Entertainment Home section (`TodaysEntertainmentCard` / `home-layouts` `entertainment` block) — not a second competing Home card. Aligns with [RB-025](./park-home-entertainment.md).
- **Chip-through-day:** Persist in-progress grid + answers for the calendar day; mark Solved when complete
- **Progress UX intent:** **Lower banner** with:
  - Started count as `n/XXX` (semantics of `n` and `XXX` — see Open questions)
  - **Percent finish** (definition — see Open questions)
- **Start semantics (intent):** “start” / try = **tried it for the day**. Open to a **Start button** if needed for a clear started signal (vs auto-start on first letter) — model not locked; see Open questions
- Quiet success (“Solved”) — no streaks-as-guilt, no coins, no ads, no casino framing
- Curated clue pack for v1 (hand-authored days; rotate) — not a full crossword CMS
- One puzzle per calendar day (seeded by date)

### Not locked — do not invent answers

See **Open questions** below. Eng should not assume winners for A–F until founder answers.

## Out of scope / later

- Leaderboards, multiplayer, streaks monetization, or Treat/fund hooks
- Multiple puzzle types shipping at once
- Full newspaper crossword / NYT-scale grids or third-party embeds
- One-shot-only mechanics as the primary Home puzzle (unscramble / riddle / Simon) — see Notes “less preferred”
- Keeping Today’s Entertainment as a peer Home hero alongside the crossword
- Expanding Entertainment catalog polish (RB-025)

## Dependencies & risks

- UXUI: swap Entertainment Home slot for crossword card; preserve grid state; calm, not arcade
- Content: 5×5 clue + answer curation (avoid recovery triggers / junk slang)
- Persistence: day-keyed progress + started / finish stats in existing store — eng detail after open questions land
- Podcast / On air content relocation depends on Open question **F**; RB-005 stays thin podcast integrity, not Home Entertainment hero
- RB-025: Entertainment primary slot retired by this item when shipped

## Open questions

Founder asked to see options — **do not pick winners** until he answers in chat.

**A. What is `XXX` in `n/XXX`?**
- Days in year (**365** / **366**)
- Total curated puzzle packs available
- Lifetime started with **no denominator** (just `n` started — drop `/XXX`)
- Streak-free calendar days started **this year** (reset Jan 1; XXX = day-of-year max or 365)

**B. Is `n` (the `1` in `1/XXX`) puzzles started (tried) or completed?**
- Founder floated **started / tried** — confirm
- Or completed / Solved only

**C. What is percent finish?**
- **Today’s** grid fill % only (letters filled ÷ cells)
- **Lifetime** average completion % across started (or completed) puzzles
- Something else (e.g. today’s puzzle: empty / in progress / solved as coarse %)

**D. Where is the lower banner?**
- Footer **inside** the crossword Home block
- Existing Home lower panel (`WeekPlanPanel` / “This week’s plan”)
- New slim **Home footer strip** (below week plan / chrome)

**E. Start model?**
1. **Start button** then grid unlocks
2. **Auto-start** on first letter / tap
3. Start button **optional**, but first interaction also counts as started

**F. What happens to podcast “On air” content after the slot swap?**
- Hide from Home entirely (RB-005 lives elsewhere later)
- Collapse under Settings / Journey
- Keep a quiet link elsewhere on Home (not the old Entertainment hero)

## Notes

- Intake **2026-09-03** founder ask: simple daily brain game/puzzle on Home; demote Entertainment.
- Follow-up **2026-09-04:** prefers **crossword** for chip-during-the-day; effort **M**; Word Unscramble demoted from default.
- Follow-up **2026-09-04 (later):** lock **5×5**; **replace On Air / Today’s Entertainment** with crossword; lower-banner `n/XXX` + % finish; start = tried-for-day (confirm); Start button optional — open questions A–F for founder.
- **Locked v1:** 5×5 Mini Crossword replacing Entertainment Home slot — effort **M**.
- **Progressive shortlist** (alternatives; crossword remains preferred):

| Idea | Mechanic | Why it chips well | Effort | Home fit / risk |
| --- | --- | --- | --- | --- |
| **Mini Crossword** *(locked default)* | **5×5** grid + 3–5 across/down clues; tap cell, enter letters | Natural multi-session; leave half-filled, finish later | M | Founder lock; clue curation cost; takes Entertainment slot |
| **Micro Number Place** | 4×4 or 6×6 sudoku-lite; fill cells over the day | Grid state is inherently progressive | M | Calm classic; parked unless crossword slips |
| **Daily Cryptogram** | Short phrase as letter-substitution cipher | Partial alphabet maps save cleanly | S–M | Strong chip pattern; not selected |
| **Mini Nonogram** | Tiny picross; fill/cross cells | Session-friendly grid painting | M | Slight “game UI” risk |
| **Word Framework** | Intersecting blanks + word bank | Crossword-lite without writing clues | S–M | Lighter content; less newspaper ritual |
| **Acrostic Quote (thin)** | Clue-words unlock a short quote | Quote fills gradually | M | More chrome |
| **Cross-Sums (Mini Kakuro)** | Number-crossword with sum clues | Same chip rhythm | M | Less familiar |

- **Also considered / less preferred for chip-at-day** (one-shot or weak resume): Daily Word Unscramble; Riddle of the Day; Pattern Pulse.
- Passes RB-013 build filter (Jeremy asked). Rank **9**. Entertainment slot replacement owned with [RB-025](./park-home-entertainment.md).
