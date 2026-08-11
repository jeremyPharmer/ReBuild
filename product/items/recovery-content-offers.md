# Recovery content: weekly podcast & book offers

| Field | Value |
| --- | --- |
| ID | RB-005 |
| Rank | 2 |
| Priority | P0 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

ReBuild’s **recovery content** surface (e.g. recovery content box / “recovery content 02”) needs curated offers users can actually take — not an empty content slot. Offers should mix **podcasts and recovery books**, from any strong recovery voice — not locked to one host.

## Outcome

Each week, the recovery content box shows **exactly two selectable offers**. The user picks one (or explores both). The pool rotates so it stays fresh. Rich Roll episodes are strong candidates in the pool, not a permanent requirement every week.

## Scope (v1 — consider only; do not build yet)

- Content types: **podcasts** and **recovery books**
- UX rule: **two offers per week**, user can select from those two
- Weekly rotation from a curated pool of high-quality recovery media
- Source-agnostic: anyone excellent at recovery content (podcast hosts, authors); not always Rich Roll
- Light “listen” / “read” outbound affordance — exact UX TBD at build time

## Out of scope / later

- Full in-app podcast player or ebook reader
- Personalized ML recommendation engine
- More than two simultaneous offers in the box
- Building the feature now (backlog / consider only)

## Weekly offer model

| Rule | Value |
| --- | --- |
| Offers shown | **2** |
| Refresh | **Weekly** |
| Mix | Podcasts and/or books (any combo: 2 podcasts, 2 books, or 1 each) |
| Selection | User can select from the two shown |
| Branding | Not required to be Rich Roll every week |

## Candidate pool (research snapshot — 2026-08-10)

### Podcasts — Rich Roll (loved starter set)

| Offer | Why it fits |
| --- | --- |
| **Rich Roll** — Zac Clark (#1005): getting sober & staying that way | Direct recovery story; purpose/service |
| **Rich Roll** — Ethan Suplee (Jun 2025): transformation, relapse, addiction patterns | Honest relapse / change narrative |
| **Rich Roll** — Addiction & Recovery Masterclass (#644) | Dense overview of addiction + recovery |

### Podcasts — other strong voices

| Offer | Why it fits |
| --- | --- |
| **Recovery Elevator** | Long-running alcohol-recovery community |
| **That Sober Guy** | Practical sobriety; strong for men’s recovery |
| **One Day At A Time Recovery Podcast** | Relapse shame; therapist + lived experience |

### Books

| Offer | Why it fits |
| --- | --- |
| **In the Realm of Hungry Ghosts** — Gabor Maté | Trauma-informed addiction classic |
| **Alcoholics Anonymous (Big Book)** | Foundational 12-step recovery text |
| **This Naked Mind** — Annie Grace | Popular alcohol-freedom / desire-change framing |
| **Atomic Habits** — James Clear | Habit systems useful for recovery routines (supportive, not addiction-specific) |

## Example week (illustrative)

1. Rich Roll × Zac Clark (podcast)  
2. *In the Realm of Hungry Ghosts* (book)

Next week might be Recovery Elevator + *This Naked Mind* — no Rich Roll required.

## Dependencies & risks

- Licensing / linking (podcast deep links, book buy/library links)
- Lightweight CMS or config for weekly pair selection
- Tone: recovery-safe framing; avoid sensational relapse content without care

## Notes

- Rank **#2**; Venmo (RB-001) stays **#1**.
- Updated 2026-08-10: expand beyond podcasts-only; weekly **two selectable** offers; books included; Rich Roll is optional excellence in the pool, not a permanent slot.
- Do not build yet — backlog + consider.
