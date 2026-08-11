# AGENTS.md

## Project overview

REBUILD is a recovery companion + financial OS. Next.js 16 App Router serves UI
and API. Persistence is `.data/db.json` (gitignored). No auth in V1.

Core logic: `src/lib/journey.ts` (pure) and `src/lib/mutations.ts` (evening /
reclaim side effects). Fund ledger: `src/lib/fund.ts` (Future + Treat Yourself).
UI under `src/app/*`.

## Product

For roadmap, backlog, ranking, and fund-model decisions, use **head-of-product**
(`.cursor/agents/head-of-product.md`) and the **product-roadmap** skill.

Source of truth:

- `product/ROADMAP.md`
- `product/BACKLOG.md`
- `product/FUND_MODEL.md`
- `product/items/`
- `PRODUCT_DECISIONS.md` (V1 locked behaviors)

## Agent roles

| Agent | Owns | Notes |
|---|---|---|
| **Reese** (backend) | `src/lib/*`, `src/app/api/**`, fund/journey tests | Journey math, skips, mutations, API contracts |
| **Bugbot** | Bug fixes across stack; prod readiness | Inspect, minimal fixes, keep Venmo Total honest; coordinate with Reese before overlapping backend |
| **UXUI** | `src/app/**/*.tsx`, `src/components/**`, `globals.css` | Home / Journey / Money / nav polish |
| **Oscar** (product) | `product/**`, roadmap ranking | Backlog + fund model docs — not runtime |

Keep changes in your lane when sharing a branch. Prefer small PRs that can ship.

## App / ship

1. Verify on **dev** first: https://rebuild-dev.fly.dev (`fly deploy -c fly.dev.toml -a rebuild-dev`)
2. **Only Reese pushes to prod:** `fly deploy -c fly.prod.toml -a rebuild-prod`. Oscar / UXUI / Bugbot do not promote prod.
3. `POST /api/reset` is blocked when `REBUILD_ENV=prod`. Prod Day-1 restart: clear `/app/.data/db.json` on `rebuild-prod` (see `DEPLOY.md`) — Reese-owned.

## Cursor Cloud notes

- `npm run dev` → http://localhost:3000
- Reset data: `POST /api/reset` (dev only) or delete `.data/db.json`
- Run `npm test` for journey/reclaim/milestone/fund tests
- `npm run build` before relying on `npm run typecheck` (Next generates types)
