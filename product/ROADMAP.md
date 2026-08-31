# JeremyOS product roadmap

Living roadmap for **JeremyOS** (formerly framed as ReBuild) — Jeremy’s **executive assistant / personal OS**: things he wants and will actually use, not a generic recovery/incentive or trail-themed product to polish indefinitely.

Recovery journey + fund/incentive tools remain **personal tools** when useful (no trail language); they are secondary to the EA / personal-OS north star. Historical item IDs keep the `RB-*` prefix. **Rebrand, not rewrite** — see [RB-012](./items/rebrand-jeremyos.md).

Maintained by the **Head of Product** agent (`.cursor/agents/head-of-product.md`).  
**Priority ranking is the primary planning signal.** Due dates, effort, and timeline support rank — they do not override it.

Last updated: 2026-08-31

## North star (locked 2026-08-29)

| Principle | Meaning |
| --- | --- |
| **Name** | **JeremyOS** (corrected from early “Jeremy PS” lean) |
| **Role** | **Executive assistant / personal OS for Jeremy** |
| **Focus** | All about Jeremy and things he wants |
| **Anti-goal** | Stop inventing a generic product “to love daily”; don’t add features for their own sake; drop trail/hiking metaphor |
| **Elevate** | Email/Gmail, podcast + regular recovery content, **to-do lists**, **five-year journal**, home cameras, workout tracker, favorite recipes, links to **other apps/sites Jeremy creates**; **morning/evening mood & feeling** ritual |
| **Recovery / fund** | Keep documented as personal tools (no trail language); ship honesty fixes if mid-flight; demote expansion vs EA / personal OS; **drop craving stats** + Home craving CTA ([RB-020](./items/drop-craving-stats-home-cta.md)) |
| **Delivery** | Rebrand / reframing over greenfield (RB-012); keep **Journey** nav label |

Build filter: see [RB-013](./items/personal-os-north-star.md).

## Current focus

| Rank | ID | Item | Priority | Status | Effort | Target due |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-012 | Rebrand to JeremyOS (EA + drop trail) | P0 | Ready | M | TBD |
| 2 | RB-013 | Personal OS north star (cut bloat) | P0 | Ready | S | TBD |
| 3 | RB-014 | To-do lists (first-class) | P0 | Backlog | M | TBD |
| 4 | RB-016 | Five-year / paper journal UX | P0 | In Progress | M | TBD |
| 5 | RB-021 | Journal photos (attach + paperclip) | P1 | Backlog | S | TBD |
| 6 | RB-022 | Journal edit, star & month calendar | P0 | In Progress | M | TBD |
| 7 | RB-002 | Email integration (Gmail) | P0 | Backlog | M | TBD |
| 8 | RB-005 | Podcast-first + regular recovery content | P0 | In Progress | M | TBD |

## Now / Next / Later

### Now

1. **RB-012 — Rebrand to JeremyOS (EA + drop trail)** — naming + executive-assistant framing + retire trail metaphor (copy/IA); **Journey nav label kept**; thin chrome pass after docs; **not** a rewrite. Detail: [`items/rebrand-jeremyos.md`](./items/rebrand-jeremyos.md).
2. **RB-013 — Personal OS north star** — enforce EA / personal-use build filter; ranking already reflects pivot. Detail: [`items/personal-os-north-star.md`](./items/personal-os-north-star.md).
3. **RB-014 — To-do lists** — founder loves these; first-class personal surface. Detail: [`items/todo-lists.md`](./items/todo-lists.md).
4. **RB-016 — Five-year / paper journal UX** — same calendar day across years; headline + short summary; journal vibes (not stacked cards). Detail: [`items/five-year-journal-ux.md`](./items/five-year-journal-ux.md). Distinct from RB-010 backfill integrity.
5. **RB-021 — Journal photos (attach + paperclip)** — optional pics on journal/evening entries; paperclip (or similar) on year slots when a photo is present; tap to view; **reuse** existing photo infra. Detail: [`items/journal-photos.md`](./items/journal-photos.md).

**Mid-flight (finish thin; do not expand):** RB-011 (fund auto-credit), RB-010 (journal backfill) — personal-tool integrity, ranks 14–15. Do **not** widen RB-010 into edit-past ([RB-022](./items/journal-edit-star-calendar.md)).

### Next

1. **RB-022 — Journal edit, star & month calendar** — month view → tap day; edit existing (headline + summary + photos); star bookmark + starred list; `/journal` only; prose-only; missed days route to RB-010. Detail: [`items/journal-edit-star-calendar.md`](./items/journal-edit-star-calendar.md). After RB-016 / RB-021; does not steal RB-016’s In Progress slot.
2. **RB-002 — Email / Gmail** — elevated; founder “My Gmail obviously.” Detail: [`items/email-integration.md`](./items/email-integration.md).
3. **RB-005 — Podcast-first + regular recovery content** — **In Progress**; keep podcast useful + no-repeat; founder still wants some regular recovery content (no duplicate item). Detail: [`items/recovery-content-offers.md`](./items/recovery-content-offers.md).
4. **RB-017 — Home cameras (Reolink)** — founder ~priority **5** on the personal-tools list; API spike / engineer handoff OK. Detail: [`items/home-cameras-reolink.md`](./items/home-cameras-reolink.md).
5. **RB-018 — Workout tracker** — personal log, not fitness SaaS. Detail: [`items/workout-tracker.md`](./items/workout-tracker.md).
6. **RB-019 — Favorite recipes** — thin favorites section. Detail: [`items/favorite-recipes.md`](./items/favorite-recipes.md).
7. **RB-015 — Hub: Jeremy’s other apps & sites** — link hub v1. Detail: [`items/jeremy-apps-hub.md`](./items/jeremy-apps-hub.md).
8. **RB-003 — Daily email: open checklist / todos** — after RB-002 (+ prefer RB-014 list model).
9. **RB-011 — Auto-credit daily savings** — complete In Progress slice; then stop money expansion.
10. **RB-010 — Backfill missed evening / journal** — complete thin slice if still useful personally (integrity only; five-year UI is RB-016; edit/star/calendar is RB-022).

### Later

1. **RB-006 — Fund buckets Future + Treat @ 30/70** — model still **locked** (`FUND_MODEL.md`); implementation polish secondary under JeremyOS.
2. **RB-001 — Auto-pull funds: checking → Venmo** — demoted from P0; personal rail when Jeremy asks; API feasibility still hard.
3. **RB-008 — Segregated account feasibility** — research preserved; not near-term.
4. **RB-004 — SMS integration** — Later; email elevated, not SMS.
5. Alternate payment destination: soccer / bank — still deferred.
6. In-app how-to walkthrough — still deferred.

**Won't Do:** RB-009 recovery patterns / craving analytics (founder: drop craving stats).  
**Done:** RB-007 accounts + onboarding; **RB-020** drop craving stats + Home craving CTA (UI cut shipped; ID remapped from branch-local RB-017 after main claimed RB-017 for cameras).

## Timeline (effort view)

| Focus | Planned | Notes |
| --- | --- | --- |
| Now (framing) | RB-012 rebrand (EA + drop trail) + RB-013 north star | Effort **M** + **S**; docs first, then chrome/copy; Journey label locked keep |
| Now (personal tools) | RB-014 todos → RB-016 five-year journal → **RB-021 journal photos** | Founder-loved journal cluster; photos thin **S** reuse of celebration photo stack |
| Next (journal tooling) | **RB-022 edit / star / month calendar** | After RB-016 + RB-021; effort **M**; photo storage risk (no auth, db.json + `.data/photos`) |
| Next (EA) | RB-002 Gmail → RB-005 podcast/recovery → RB-017 cameras → RB-018 workout → RB-019 recipes → RB-015 hub → RB-003 digest | Personal OS cluster; hub needs Jeremy’s app list |
| Finish thin | RB-011, RB-010 | Do not expand money/daily-loop polish; journal UI = RB-016; media = RB-021; edit/star/calendar = RB-022 |
| Later (personal fund) | RB-006, RB-001 | Locked model; rails demoted |
| Later / paused | RB-008, RB-004 | Unrequested channels |
| Done (cut) | RB-020 drop craving stats + Home craving CTA | Surfaces removed; mood loop kept |
| Won't Do | RB-009 | Craving pattern analytics |

## Ranking principles

1. **Jeremy will use it** beats generic product completeness (RB-013)
2. Rank order is authoritative; P-tags support rank
3. Ship a thin v1 over boiling the ocean
4. Personal-tool honesty (e.g. fund ledger) can finish mid-flight without re-elevating money OS
5. No silent reordering — document why rank changed in the item Notes
6. Do not kill recovery/fund history without evidence — demote and note instead; **exception:** founder-explicit cuts (e.g. craving stats) → Won't Do + thin removal item

## How to update

Use the **head-of-product** agent or the **product-roadmap** skill. Keep `ROADMAP.md`, `BACKLOG.md`, and `product/items/*` aligned.
