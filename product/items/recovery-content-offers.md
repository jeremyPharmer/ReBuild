# Recovery content: weekly podcast & book offers

| Field | Value |
| --- | --- |
| ID | RB-005 |
| Rank | 4 |
| Priority | P0 |
| Status | In Progress |
| Effort | M |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

ReBuild’s **recovery content** surface needs curated offers users can actually take — not an empty content slot, and not the same episodes/articles recycled once the user has already heard or read them. Offers should mix **podcasts and recovery articles/books**, from any strong recovery voice — not locked to one host.

## Outcome

**Shipped surface (active polish):** Recovery Content card offers a mix of podcasts + articles; once something is heard or read, it is **never re-offered**. Catalog is large and deep enough that the unheard/unread pool stays healthy.

**Original weekly model (still consider):** Each week, the recovery content box shows **exactly two selectable offers**. The user picks one (or explores both). The pool rotates so it stays fresh. Rich Roll episodes are strong candidates in the pool, not a permanent requirement every week.

## Scope

### In progress — deepen the already-shipped card (do not wait on weekly-2)

Runtime already ships a thinner Recovery Content surface (~5 offers: 3 podcasts + 2 articles) with `listenedPodcasts` (and read) tracking. Founder feedback (2026-08-21): content **repeats too often**; add **more sources**, go **deeper**, and if something was heard or read, **don’t repeat it**.

Polish / expand (this slice):

- Grow curated catalog well beyond ~10 podcasts / ~10 articles — more sources, deeper episode/article picks
- **Never re-offer** ids the user has already heard or read (no fallback into the consumed pool when the fresh pool is thin)
- Keep the shipped multi-offer card shape; this is not a Venmo/fund blocker and does **not** replace rank/P0 relative to RB-001

### v1 consider — weekly two-offer model (do not elevate yet)

- Content types: **podcasts** and **recovery books**
- UX rule: **two offers per week**, user can select from those two
- Weekly rotation from a curated pool of high-quality recovery media
- Source-agnostic: anyone excellent at recovery content (podcast hosts, authors); not always Rich Roll
- Light “listen” / “read” outbound affordance — exact UX TBD at build time

## Out of scope / later

- Full in-app podcast player or ebook reader
- Personalized ML recommendation engine
- Building the weekly-two UX before the no-repeat / deeper-catalog polish on the shipped card

## Weekly offer model

| Rule | Value |
| --- | --- |
| Offers shown | **2** (consider model; shipped card currently shows ~5) |
| Refresh | **Weekly** (consider); shipped picker refreshes from catalog |
| Mix | Podcasts and/or books/articles |
| Selection | User can select from the offers shown |
| Branding | Not required to be Rich Roll every week |
| Repeat policy | **Never re-offer** heard/read ids (locked for shipped polish) |

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
- Lightweight CMS or config for catalog + weekly pair selection
- Tone: recovery-safe framing; avoid sensational relapse content without care
- Thin catalog + fallback-to-heard in `pickRecoveryOffers` is the known repeat cause — fix policy and catalog size together

## Notes

- Rank **#4** / **P0** unchanged (2026-08-21). Deepening the shipped Recovery Content card; does **not** jump ahead of Venmo (RB-001) or auto-credit (RB-011).
- **2026-08-21 founder feedback:** recovery content repeats too often → expand sources, go deeper, never re-offer heard/read. Status → **In Progress** for that polish; weekly 2-offer model remains backlog/consider.
- Updated 2026-08-10: expand beyond podcasts-only; weekly **two selectable** offers; books included; Rich Roll is optional excellence in the pool, not a permanent slot.
- Shipped thinner surface (podcasts + articles, multi-offer card) already live; this item now tracks catalog depth + strict no-repeat on that surface, plus the still-deferred weekly-2 design.
