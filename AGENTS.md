# AGENTS.md

## Project overview

REBUILD is a recovery companion + financial OS. Next.js 16 App Router serves UI
and API. Persistence is `.data/db.json` (gitignored). No auth in V1.

Core logic: `src/lib/journey.ts` (pure) and `src/lib/mutations.ts` (evening /
reclaim side effects). UI under `src/app/*`.

## Cursor Cloud notes

- `npm run dev` → http://localhost:3000
- Reset data: `POST /api/reset` or delete `.data/db.json`
- Run `npm test` for journey/reclaim/milestone tests
- `npm run build` before relying on `npm run typecheck` (Next generates types)
