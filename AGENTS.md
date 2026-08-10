# AGENTS.md

## Project overview

REBUILD is a recovery companion + financial OS. Next.js 16 App Router serves UI
and API. Persistence is `.data/db.json` (gitignored). No auth in V1.

Core logic: `src/lib/journey.ts` (pure) and `src/lib/mutations.ts` (evening /
reclaim side effects). Fund ledger: `src/lib/fund.ts`. UI under `src/app/*`.

## Agent roles

| Agent | Owns | Notes |
|---|---|---|
| **Reese** (backend) | `src/lib/*`, `src/app/api/**`, `PRODUCT_DECISIONS.md` tests | Journey math, skips, mutations, API contracts |
| **Bugbot** | Bug fixes across stack; prod readiness | Inspect, minimal fixes, keep Venmo Total honest; coordinate with Reese before overlapping backend |
| **UXUI** | `src/app/**/*.tsx`, `src/components/**`, `globals.css` | Home / Journey / nav polish |
| **Oscar** (product) | `product/**`, roadmap ranking | Backlog only — not runtime |

Keep changes in your lane when sharing a branch. Prefer small PRs that can ship.

## Prod path (simple)

1. Source of truth for app code: tip that includes V1 + home/journey UX
2. Verify on **dev** first: https://rebuild-dev.fly.dev
3. Deploy **prod** only when ready: `fly deploy -c fly.prod.toml -a rebuild-prod`
4. Never wipe prod data (`POST /api/reset` is blocked when `REBUILD_ENV=prod`)

## Cursor Cloud notes

- `npm run dev` → http://localhost:3000
- Reset data: `POST /api/reset` (dev only) or delete `.data/db.json`
- Run `npm test` for journey/reclaim/milestone/fund tests
- `npm run build` before relying on `npm run typecheck` (Next generates types)
