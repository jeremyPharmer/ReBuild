# Agents

## Product

For roadmap, backlog, ranking, and fund-model decisions, use **head-of-product** (`.cursor/agents/head-of-product.md`) and the **product-roadmap** skill.

Source of truth:

- `product/ROADMAP.md`
- `product/BACKLOG.md`
- `product/FUND_MODEL.md`
- `product/items/`
- `PRODUCT_DECISIONS.md` (V1 locked behaviors)

## App / ship

Implement and deploy against Fly **dev** then **prod** per `DEPLOY.md`. Prod data wipe for Day-1 restart: clear `/app/.data/db.json` on `rebuild-prod` (reset API is blocked on prod).
