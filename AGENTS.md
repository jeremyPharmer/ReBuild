# AGENTS.md

## Project overview

JeremyOS is Jeremy's executive assistant and personal OS. Next.js 16 App Router serves UI
and API. Persistence is **Vercel KV** (`db.json`) + **Vercel Blob** (photos); local dev uses `.data/` (gitignored). Auth + multi-user.

Core logic: `src/lib/journey.ts` (pure) and `src/lib/mutations.ts` (evening /
reclaim side effects). Fund ledger: `src/lib/fund.ts` (Future + Treat Yourself).
Storage: `src/lib/storage.ts`. UI under `src/app/*`.

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

Implement and deploy against **Vercel** per `DEPLOY.md`. Prod data lives in KV/Blob — not wiped on deploy.

## Agent roles

| Agent | Owns | Notes |
|---|---|---|
| **Reese** (backend) | `src/lib/*`, `src/app/api/**`, fund/journey tests | Journey math, skips, mutations, API contracts |
| **Bugbot** | Bug fixes across stack; prod readiness | Inspect, minimal fixes, keep Venmo Total honest; coordinate with Reese before overlapping backend |
| **UXUI** | `src/app/**/*.tsx`, `src/components/**`, `globals.css` | Home / Journey / Money / nav polish |
| **Oscar** (product) | `product/**`, roadmap ranking | Backlog + fund model docs — not runtime |

Keep changes in your lane when sharing a branch. Prefer small PRs that can ship.

## App / ship

1. Verify on **Vercel Preview** first (PR deploy)
2. Merge to **main** for production
3. `POST /api/reset` is blocked on production (`JEREMYOS_ENV=prod` or `VERCEL_ENV=production`)

## Cursor Cloud notes

- `npm run dev` → http://localhost:3000
- Reset data: `POST /api/reset` (dev/preview only) or delete `.data/db.json`
- Run `npm test` for journey/reclaim/milestone/fund tests
- `npm run build` before relying on `npm run typecheck` (Next generates types)
