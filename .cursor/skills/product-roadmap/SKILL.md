---
name: product-roadmap
description: Maintain ReBuild product roadmap, backlog ranking, efforts, due dates, and timelines. Use when adding features, reprioritizing, planning releases, or when the head-of-product agent updates product docs.
---

# Product roadmap

## When to use

- Adding or changing backlog items
- Ranking / prioritization
- Setting efforts, due dates, or timeline
- Release / milestone planning
- Answering "what should we build next?"

## Files to keep in sync

1. `product/items/<slug>.md` — canonical item detail
2. `product/BACKLOG.md` — index table of all items
3. `product/ROADMAP.md` — ranked focus + timeline view

## Priority system

| Rank | Meaning |
| --- | --- |
| 1 | Highest product priority — do next |
| 2+ | Ordered after 1; lower number = sooner |

Also tag severity of need:

- **P0** — must for near-term product value / critical path
- **P1** — important, scheduled after P0s
- **P2** — nice to have / later

Rank order is authoritative when P-tags conflict.

## Effort sizes

`XS` (<1 day) · `S` (1–3 days) · `M` (~1 week) · `L` (2–3 weeks) · `XL` (month+) · `TBD`

## Item file template

```markdown
# <Title>

| Field | Value |
| --- | --- |
| ID | RB-XXX |
| Rank | <n> |
| Priority | P0 / P1 / P2 |
| Status | Backlog |
| Effort | S / M / L / … |
| Target due | YYYY-MM-DD or TBD |
| Milestone | v1 / v1.x / later |
| Owner | Product |

## Problem

## Outcome

## Scope (v1)

## Out of scope / later

## Dependencies & risks

## Notes
```

## Update checklist

When changing the roadmap:

1. Edit or create the item file
2. Refresh rank order across all open items (unique ranks)
3. Update `BACKLOG.md` table
4. Update `ROADMAP.md` Now / Next / Later and timeline
5. Summarize the delta for the user in 3–6 bullets
