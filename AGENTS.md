# AGENTS.md

## Project overview

JeremyOS is Jeremy's executive assistant and personal OS. Next.js 16 App Router serves UI
and API. Persistence is `.data/db.json` (gitignored). Auth + multi-user.

Core logic: `src/lib/journey.ts` (pure) and `src/lib/mutations.ts` (evening /
reclaim side effects). Fund ledger: `src/lib/fund.ts` (Future + Treat Yourself).
UI under `src/app/*`.

## Product

For roadmap, backlog, ranking, and fund-model decisions, use **head-of-product**
(`.cursor/agents/head-of-product.md`) and the **product-roadmap** skill.

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

Verify locally (`npm run dev`), then deploy **prod** per `DEPLOY.md`. **`jeremyos-dev` is retired** — do not deploy to or wait on a Fly staging app. Prod data wipe for Day-1 restart: clear `/app/.data/db.json` on `jeremyos-prod` (reset API is blocked on prod).

## Agent roles

| Agent | Owns | Notes |
|---|---|---|
| **Reese** (backend) | `src/lib/*`, `src/app/api/**`, fund/journey tests | Journey math, skips, mutations, API contracts |
| **Bugbot** | Bug fixes across stack; prod readiness | Inspect, minimal fixes, keep Venmo Total honest; coordinate with Reese before overlapping backend |
| **UXUI** | `src/app/**/*.tsx`, `src/components/**`, `globals.css` | Home / Journey / Money / nav polish |
| **Oscar** (product) | `product/**`, roadmap ranking | Backlog + fund model docs — not runtime |

Keep changes in your lane when sharing a branch. Prefer small PRs that can ship.

## App / ship

1. Verify locally: `npm run dev` → http://localhost:3000
2. Deploy **prod**: `fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false --vm-memory 512` (or Actions → Deploy)
3. `POST /api/reset` is blocked when `JEREMYOS_ENV=prod`. Prod Day-1 restart: clear `/app/.data/db.json` on the prod Fly app (see `DEPLOY.md`).

## Cursor Cloud notes

- `npm run dev` → http://localhost:3000
- Reset data: `POST /api/reset` (non-prod / local only) or delete `.data/db.json`
- Run `npm test` for journey/reclaim/milestone/fund tests
- `npm run build` before relying on `npm run typecheck` (Next generates types)
