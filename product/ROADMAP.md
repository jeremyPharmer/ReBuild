# JeremyOS product roadmap

Living roadmap for **JeremyOS** (formerly framed as ReBuild) — a **personal OS for Jeremy**: things he wants and will actually use, not a generic recovery/incentive product to polish indefinitely.

Recovery journey + fund/incentive tools remain **personal tools** when useful; they are secondary to the personal-OS north star. Historical item IDs keep the `RB-*` prefix.

Maintained by the **Head of Product** agent (`.cursor/agents/head-of-product.md`).  
**Priority ranking is the primary planning signal.** Due dates, effort, and timeline support rank — they do not override it.

Last updated: 2026-08-29

## North star (locked 2026-08-29)

| Principle | Meaning |
| --- | --- |
| **Name** | **JeremyOS** (corrected from early “Jeremy PS” lean) |
| **Focus** | All about Jeremy and things he wants |
| **Anti-goal** | Stop inventing a generic product “to love daily”; don’t add features for their own sake |
| **Elevate** | Email/Gmail, podcast + regular recovery content, **to-do lists**, **five-year journal**, home cameras, workout tracker, favorite recipes, links to **other apps/sites Jeremy creates** |
| **Recovery / fund** | Keep documented; ship honesty fixes if mid-flight; demote expansion vs personal OS |

Build filter: see [RB-013](./items/personal-os-north-star.md).

## Current focus

| Rank | ID | Item | Priority | Status | Effort | Target due |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-012 | Rebrand to JeremyOS | P0 | Ready | M | TBD |
| 2 | RB-013 | Personal OS north star (cut bloat) | P0 | Ready | S | TBD |
| 3 | RB-014 | To-do lists (first-class) | P0 | Backlog | M | TBD |
| 4 | RB-016 | Five-year / paper journal UX | P0 | In Progress | M | TBD |
| 5 | RB-002 | Email integration (Gmail) | P0 | Backlog | M | TBD |
| 6 | RB-005 | Podcast-first + regular recovery content | P0 | In Progress | M | TBD |
| 7 | RB-017 | Home cameras via Reolink | P1 | Backlog | M | TBD |

## Now / Next / Later

### Now

1. **RB-012 — Rebrand to JeremyOS** — naming + framing; thin chrome rename pass after docs. Detail: [`items/rebrand-jeremyos.md`](./items/rebrand-jeremyos.md).
2. **RB-013 — Personal OS north star** — enforce build filter; ranking already reflects pivot. Detail: [`items/personal-os-north-star.md`](./items/personal-os-north-star.md).
3. **RB-014 — To-do lists** — founder loves these; first-class personal surface. Detail: [`items/todo-lists.md`](./items/todo-lists.md).
4. **RB-016 — Five-year / paper journal UX** — same calendar day across years; headline + short summary; journal vibes (not stacked cards). Detail: [`items/five-year-journal-ux.md`](./items/five-year-journal-ux.md). Distinct from RB-010 backfill integrity.
5. **RB-002 — Email / Gmail** — elevated; founder “My Gmail obviously.” Detail: [`items/email-integration.md`](./items/email-integration.md).
6. **RB-005 — Podcast-first + regular recovery content** — **In Progress**; keep podcast useful + no-repeat; founder still wants some regular recovery content (no duplicate item). Detail: [`items/recovery-content-offers.md`](./items/recovery-content-offers.md).
7. **RB-017 — Home cameras (Reolink)** — founder ~priority **5** on the personal-tools list; API spike / engineer handoff OK. Detail: [`items/home-cameras-reolink.md`](./items/home-cameras-reolink.md).

**Mid-flight (finish thin; do not expand):** RB-011 (fund auto-credit), RB-010 (journal backfill) — personal-tool integrity, ranks 12–13.

### Next

1. **RB-018 — Workout tracker** — personal log, not fitness SaaS. Detail: [`items/workout-tracker.md`](./items/workout-tracker.md).
2. **RB-019 — Favorite recipes** — thin favorites section. Detail: [`items/favorite-recipes.md`](./items/favorite-recipes.md).
3. **RB-015 — Hub: Jeremy’s other apps & sites** — link hub v1. Detail: [`items/jeremy-apps-hub.md`](./items/jeremy-apps-hub.md).
4. **RB-003 — Daily email: open checklist / todos** — after RB-002 (+ prefer RB-014 list model).
5. **RB-011 — Auto-credit daily savings** — complete In Progress slice; then stop money expansion.
6. **RB-010 — Backfill missed evening / journal** — complete thin slice if still useful personally (integrity only; five-year UI is RB-016).

### Later

1. **RB-006 — Fund buckets Future + Treat @ 30/70** — model still **locked** (`FUND_MODEL.md`); implementation polish secondary under JeremyOS.
2. **RB-001 — Auto-pull funds: checking → Venmo** — demoted from P0; personal rail when Jeremy asks; API feasibility still hard.
3. **RB-009 — Recovery patterns (Journey)** — paused (was daily-loop “lovable product”); pull forward only on ask.
4. **RB-008 — Segregated account feasibility** — research preserved; not near-term.
5. **RB-004 — SMS integration** — Later; email elevated, not SMS.
6. Alternate payment destination: soccer / bank — still deferred.
7. In-app how-to walkthrough — still deferred.

**Done:** RB-007 accounts + trail onboarding.

## Timeline (effort view)

| Focus | Planned | Notes |
| --- | --- | --- |
| Now (framing) | RB-012 rebrand + RB-013 north star | Effort **M** + **S**; docs first, then chrome |
| Now (personal tools) | RB-014 todos → RB-016 five-year journal → RB-002 Gmail → RB-005 podcast/recovery → RB-017 cameras | Founder-loved / liked skills; cameras ~5 on list |
| Next | RB-018 workout; RB-019 recipes; RB-015 hub; RB-003 digest | Personal OS cluster; hub needs Jeremy’s app list |
| Finish thin | RB-011, RB-010 | Do not expand money/daily-loop polish; journal UI redesign = RB-016 |
| Later (personal fund) | RB-006, RB-001 | Locked model; rails demoted |
| Later / paused | RB-009, RB-008, RB-004 | Generic polish or unrequested channels |

## Ranking principles

1. **Jeremy will use it** beats generic product completeness (RB-013)
2. Rank order is authoritative; P-tags support rank
3. Ship a thin v1 over boiling the ocean
4. Personal-tool honesty (e.g. fund ledger) can finish mid-flight without re-elevating money OS
5. No silent reordering — document why rank changed in the item Notes
6. Do not kill recovery/fund history without evidence — demote and note instead

## How to update

Use the **head-of-product** agent or the **product-roadmap** skill. Keep `ROADMAP.md`, `BACKLOG.md`, and `product/items/*` aligned.
