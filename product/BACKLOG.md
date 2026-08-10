# ReBuild product backlog

Index of all product items. Canonical detail lives in `product/items/`.

**Ranking rule:** lower rank number = higher priority. Rank is the source of truth.

| Rank | ID | Item | Priority | Status | Effort | Target due | Milestone | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-001 | Auto-pull funds: checking → Venmo | P0 | Backlog | L | TBD | v1 | [items/auto-pull-funds-venmo.md](./items/auto-pull-funds-venmo.md) |
| 2 | RB-005 | Recovery content: podcast recommendations | P0 | Backlog | S | TBD | v1 | [items/recovery-content-podcasts.md](./items/recovery-content-podcasts.md) |
| 3 | RB-002 | Email integration | P1 | Backlog | M | TBD | later | [items/email-integration.md](./items/email-integration.md) |
| 4 | RB-003 | Daily email: open checklist at close of day | P1 | Backlog | S | TBD | later | [items/daily-open-checklist-email.md](./items/daily-open-checklist-email.md) |
| 5 | RB-004 | SMS integration | P2 | Backlog | M | TBD | later | [items/sms-integration.md](./items/sms-integration.md) |

## Status counts

| Status | Count |
| --- | --- |
| Backlog | 5 |
| Ready | 0 |
| In Progress | 0 |
| Blocked | 0 |
| Done | 0 |
| Won't Do | 0 |

## Intake

New items: create `product/items/<slug>.md`, assign next ID (`RB-00N`), insert at the correct rank (renumber as needed), then update this table and `ROADMAP.md`. Prefer the **head-of-product** agent or `/product-roadmap` skill.
