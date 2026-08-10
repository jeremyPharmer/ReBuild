# Recovery content: podcast recommendations

| Field | Value |
| --- | --- |
| ID | RB-005 |
| Rank | 2 |
| Priority | P0 |
| Status | Backlog |
| Effort | S |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

ReBuild’s **recovery content** surface (e.g. recovery content box / “recovery content 02”) needs curated offers users can actually take — not an empty content slot. Podcasts are a low-friction first offer set, especially recovery-focused conversations anchored by voices like **Rich Roll**.

## Outcome

When a user opens recovery content in ReBuild, they can see a small set of podcast options (a couple of offers) they can explore. v1 is curated recommendations, not a full media platform.

## Scope (v1 — consider only; do not build yet)

- Curated list of recovery-relevant podcasts / episodes
- Present **a couple of options** inside the existing recovery content box
- Lead with **Rich Roll** recovery-oriented material; include 1–2 complementary shows
- Deep-link or clear “listen” affordance (Apple / Spotify / show page) — exact UX TBD at build time

## Out of scope / later

- Full podcast player inside the app
- Personalized recommendation engine
- User-generated playlists
- Building the recovery-content UI beyond what’s needed for offers (explicitly: **consider / backlog only for now**)

## Candidate offers (research snapshot — 2026-08-10)

Starter set for curation (not final copy):

| Offer | Why it fits |
| --- | --- |
| **The Rich Roll Podcast** — Zac Clark (#1005): getting sober & staying that way | Direct recovery story; recent; purpose/service angle |
| **The Rich Roll Podcast** — Ethan Suplee (Jun 2025): transformation, relapse, addiction patterns | Recent; honest relapse / change narrative |
| **The Rich Roll Podcast** — Addiction & Recovery Masterclass (#644) | Dense overview of addiction + recovery perspectives |
| **Recovery Elevator** | Long-running alcohol-recovery community show |
| **That Sober Guy** | Practical sobriety, strong for men’s recovery |
| **One Day At A Time Recovery Podcast** | Relapse shame, therapist + lived-experience framing |

Product default for the box: **2 offers** visible (e.g. one Rich Roll episode + one dedicated recovery show), with room to rotate.

## Dependencies & risks

- Licensing / linking norms (outbound links vs embeds)
- Keeping recommendations fresh without a heavy CMS
- Tone: recovery-safe framing; avoid sensational relapse content without care

## Notes

- Added 2026-08-10. Ranked **#2** overall — more important than email/SMS/digest work; **Venmo (RB-001) stays #1**.
- User intent: recovery content surface should be able to present podcast offers; do not build the feature yet — backlog + consider.
- “Rich role” interpreted as **Rich Roll** (recovery-relevant host/show).
