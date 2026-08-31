# JeremyOS

Jeremy's executive assistant and personal operating system — daily rhythm, journal, fund, and recovery tools in one place.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- **Vercel KV** — `db.json` (users + journey state)
- **Vercel Blob** — celebration / journal photos
- Vitest for journey/money logic

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000 (local .data/db.json)
npm test
npm run build
```

## Deploy

Hosted on **Vercel**. See `DEPLOY.md` for KV/Blob setup, env vars, and Fly → Vercel data migration.

| Env | URL |
|---|---|
| **Production** | Set `APP_URL` in Vercel (e.g. `https://jeremyos.vercel.app`) |
| **Preview** | Vercel branch deploys |

Primary nav: Home · Journey · Journal · Settings
