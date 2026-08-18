# ReBuild product backlog

Index of all product items. Canonical detail lives in `product/items/`.

**Ranking rule:** lower rank number = higher priority. Rank is the source of truth.

| Rank | ID | Item | Priority | Status | Effort | Target due | Milestone | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RB-007 | Accounts + trail onboarding (multi-user) | P0 | Done | XL | TBD | v1 | [items/account-creation-onboarding.md](./items/account-creation-onboarding.md) |
| 2 | RB-001 | Auto-pull funds: checking → Venmo | P0 | Backlog | L | TBD | v1 | [items/auto-pull-funds-venmo.md](./items/auto-pull-funds-venmo.md) |
| 3 | RB-005 | Recovery content: weekly podcast & book offers | P0 | Backlog | M | TBD | v1 | [items/recovery-content-offers.md](./items/recovery-content-offers.md) |
| 4 | RB-006 | Fund buckets: Future + Treat @ 30/70 | P0 | Backlog | M | TBD | v1 | [items/fund-two-buckets.md](./items/fund-two-buckets.md) |
| 5 | RB-009 | Recovery patterns (Journey) | P1 | In Progress | M | TBD | v1.x | [items/recovery-patterns-insights.md](./items/recovery-patterns-insights.md) |
| 6 | RB-002 | Email integration | P1 | Backlog | M | TBD | later | [items/email-integration.md](./items/email-integration.md) |
| 7 | RB-003 | Daily email: open checklist at close of day | P1 | Backlog | S | TBD | later | [items/daily-open-checklist-email.md](./items/daily-open-checklist-email.md) |
| 8 | RB-004 | SMS integration | P2 | Backlog | M | TBD | later | [items/sms-integration.md](./items/sms-integration.md) |
| 9 | RB-008 | Segregated ReBuild account (feasibility) | P1 | Backlog | S | TBD | later | [items/segregated-rebuild-account-rails.md](./items/segregated-rebuild-account-rails.md) |

## Status counts

| Status | Count |
| --- | --- |
| Backlog | 7 |
| Ready | 0 |
| In Progress | 1 |
| Blocked | 0 |
| Done | 1 |
| Won't Do | 0 |

## Intake

New items: create `product/items/<slug>.md`, assign next ID (`RB-00N`), insert at the correct rank (renumber as needed), then update this table and `ROADMAP.md`. Prefer the **head-of-product** agent or `/product-roadmap` skill.

## Related

- Fund model (locked buckets): [`FUND_MODEL.md`](./FUND_MODEL.md)
- Roadmap / timeline: [`ROADMAP.md`](./ROADMAP.md)
- V1 locked behaviors: [`../PRODUCT_DECISIONS.md`](../PRODUCT_DECISIONS.md)
