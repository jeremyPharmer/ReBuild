# Recovery patterns (Journey)

| Field | Value |
| --- | --- |
| ID | RB-009 |
| Rank | 5 |
| Priority | P1 |
| Status | Backlog |
| Effort | M |
| Target due | TBD |
| Milestone | v1.x |
| Owner | Product (build later: Reese aggregations, UXUI Journey) |

## Problem

The founder (Jeremy, prod user) is already tapping a lot of daily-loop data — craving intensity before/after, situation, mitigation outcome, and how often supports/provisions actually happen (gym, meditation, etc.). Journey already stores a trail and two over-time charts, and the craving complete screen promises: “Your data will help you notice patterns later — not diagnose them.” That promise is unpaid. He wants a *meaningful* view of this data, not a dump of every field, and is unsure where it belongs and which signals matter.

Raw craving counts (“you had 47 cravings”) can shame. Skip lists are especially easy to make punitive. Recovery integrity: show **what worked** and **when / with what**, not volume leaderboards.

## Outcome

Journey’s existing **Over time** panel becomes the place the daily loop pays off: a companion view of patterns (what brought intensity down, when headwinds land, whether supports keep their weekly rhythm). Empty until there is enough data. No sixth nav tab. Home stays the daily loop (optional later: one rotating sentence). Money stays on Rewards. Journal stays prose.

## Scope (v1)

Expand Journey `/journey` “Over time.” Do **not** add a nav item.

- **What works (playbook):** rank mitigation `outcome` chips by average intensity drop (`intensityBefore` − `intensityAfter`) and sample size. Hide until a minimum n (e.g. **3** completed events with `intensityAfter`). Example: “Walk −4.1 · n=12”, not a craving count.
- **When (headwind hours):** time-of-day buckets and/or day-of-week from `CravingEvent.at`, honoring profile timezone. Example: “Most headwinds land 5–8pm.” `src/lib/trends.ts` already comments this as not-built and says keep capturing `at`.
- **Did it come down:** the existing craving-points chart sums `intensityBefore` only. v1 should show drop and/or remaining intensity so the story is “bringing it down,” not “craving pile.”
- **Provision rhythm:** last **4 weeks** of each enabled support vs weekly target (simple bars or X/target per week). Home already shows *this week*; Journey shows *over time*. Optional: craving-points on days with vs without a chosen support, with a plain-language caveat (curiosity, not medical diagnosis).
- **Tone:** companion, not diagnosis. Empty states until enough data. Free-text `situation` stays private on the trail (already PrivateReveal). No skip counts.

## Out of scope / later

- Home rotating insight card (“This week, Walk brought cravings down the most”) — one sentence only, not a dashboard
- Sleep / stress / mood vs same-day craving load (correlation engine)
- Morning `trigger` vs later craving that day
- Sleep *hours* on the conditions chart (today the chart uses quality)
- Situation clustering / chips harvested from repeated free-text
- Recovery-content `actionNote` themes
- Sunday recap email (can later feed RB-003; do not block on RB-002/003)
- Export
- New nav tab
- Raw skip lists, quote IDs, reminder logs, podcast listen IDs, journal/intention as analytics, fund/reclaim (Rewards), deprecated morning/evening craving sliders

## Dependencies & risks

- Data already in state: `state.cravings` (`CravingEvent`), `state.supports` / day provisions, morning + evening check-ins. No new capture required for v1.
- Aggregations: Reese on `src/lib/trends.ts` (hook already exists) + Journey UI: UXUI.
- **Shame / diagnosis risk:** volume scores and skip counts feel punitive. Minimum-n gates and companion copy are load-bearing, not polish.
- **Sparse `intensityAfter`:** playbook is empty until users complete the delay loop. Do not invent drop from before-only events.
- **Small-n “gym vs rest” comparisons** can look like medical claims. Caveat copy required if included.
- Does **not** need Venmo (RB-001) or fund buckets (RB-006). Must not jump those P0s or weekly content (RB-005).
- Timezone: use the same day-key / profile timezone already used in trends.

## Notes

- Intake: **2026-08-18** from founder (Jeremy, prod user). Rank **5** — first P1 after open P0s (RB-001, RB-005, RB-006). P0s not reordered. Status **Backlog**. Target due **TBD**.
- Daily-loop payoff and an in-app promise already shipped; still behind money OS and weekly content.
- **Placement:** Insights live on **Journey** (already trail + trends). Five tabs is enough (Home / Journey / Rewards / Journal / Settings). No sixth tab. Optional later: a *single* rotating insight line on Home. Money/fund stays on Rewards. Journal stays prose.

### Signal inventory

**High — close the unpaid promise, actionable (v1):**

1. **What worked** — `outcome` × (`intensityBefore` − `intensityAfter`). Rank interventions by average drop and sample size. Founder’s “reasons why cravings were mitigated.”
2. **When** — `at` → time-of-day buckets and day-of-week (already anticipated in `trends.ts`).
3. **Did it come down** — before→after / remaining intensity; more honest than craving volume.
4. **Provision rhythm** — completions vs weekly target over recent weeks. Optional: craving load on days with gym vs without, with a caveat.

**Medium — later; needs structure or is noisy:**

5. Morning conditions (stress/sleep/mood) vs same-day craving load — correlation, not causation; “watch this weather.”
6. Free-text `situation` — powerful but messy; do not NLP-cluster in v1. Later: chips from the user’s own repeated phrases.
7. Morning `trigger` vs later craving that day.
8. Sleep *hours* (captured; conditions chart uses quality today).
9. Recovery-content `actionNote` themes.

**Low / keep buried or private:**

- Raw skip lists, quote IDs, reminder logs, podcast listen IDs
- Journal / intention as “analytics”
- Fund / reclaim (Rewards)
- Deprecated morning/evening craving sliders

### Creative uses (full picture; not all in v1)

1. **Your playbook** — ranked “Walk −4.1 · n=12” (v1).
2. **Headwind hours** — time-of-day / day-of-week (v1; `at` already captured).
3. **One Home whisper** — a single sentence when n is enough (later). Daily loop must stay worth opening.
4. **Rhythm vs weather** — provision calendar/heatmap next to craving-points; “gym days vs rest days” as curiosity, not a verdict (optional thin slice in v1; richer heatmap later).
5. **Craving drop, not craving pile** — intensity remaining or average drop over time (v1).
6. **Sunday recap** — later, can feed RB-003 daily/weekly email; don’t block on email (RB-002/003).
7. **Situation chips** — later, harvest repeated free-text into faster logging. Out of v1.

### Already captured / already shown (audit)

- Cravings: `at`, `intensityBefore`, `intensityAfter`, `situation`, `intervention` (`"delay"`), `outcome` (Walk, Shower, Eat, Exercise, Leave environment, Contact someone, Journal, Breathing, Other).
- Supports: weekly targets, completions (date, type, notes, `actionNote`, `completedAt`); one-off day provisions.
- Morning: sleep hours + quality, mood, energy, stress, intention, optional trigger. Evening: mood, stress, one-line / standout journal.
- Journey trail already shows per-day morning, provision chips, craving “Headwind” (before→after + outcome; situation behind PrivateReveal), evening one-line; conditions line chart; craving-points = sum of `intensityBefore`; milestone trail.
- Home: today’s supports with week X/target, craving CTA. Journal: evening prose. Settings: support targets.
