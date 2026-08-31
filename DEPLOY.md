# JeremyOS on Vercel

Deploy target is **Vercel** (Next.js). Persistence uses **Vercel KV** (db.json) and **Vercel Blob** (photos). Local dev still uses `.data/` on disk when KV/Blob env vars are unset.

## Environments

| Env | Vercel | Purpose |
|---|---|---|
| **Preview** | PR / branch deploys | Experiments; `/api/reset` allowed when not production |
| **Production** | `main` branch | Founder true-source data |

Set a stable production URL via **`APP_URL`** (custom domain or `https://your-project.vercel.app`).

## One-time Vercel setup

1. **Import repo** at [vercel.com/new](https://vercel.com/new) → connect `jeremyPharmer/ReBuild` (or renamed repo).
2. **Storage → Create KV store** (Upstash Redis) → connect to the project.  
   Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. **Storage → Create Blob store** → connect to the project.  
   Vercel injects `BLOB_READ_WRITE_TOKEN`.
4. **Environment variables** (Production + Preview as needed):

| Variable | Example | Notes |
|---|---|---|
| `AUTH_SECRET` | long random string | Session signing |
| `CRON_SECRET` | long random string | Reminder cron auth |
| `RESEND_API_KEY` | `re_…` | Email |
| `EMAIL_FROM` | `JeremyOS <noreply@yourdomain.com>` | Verified in Resend |
| `APP_URL` | `https://jeremyos.vercel.app` | Email links + reminders |
| `JEREMYOS_ENV` | `prod` on Production only | Blocks `/api/reset` on prod |

5. **Deploy** — push to `main` or run `vercel --prod` locally.

## Migrate data from Fly

Export founder data from the old Fly volume:

```bash
fly ssh console -a rebuild-prod -C "cat /app/.data/db.json" > .data/db.json
# optional: copy photos dir from Fly if you have them locally
```

Upload to Vercel storage:

```bash
KV_REST_API_URL=... KV_REST_API_TOKEN=... BLOB_READ_WRITE_TOKEN=... \
  node scripts/migrate-to-vercel.mjs
```

Values come from the Vercel project → Storage → KV / Blob → `.env.local` snippet.

## Cron (morning / evening reminders)

`vercel.json` runs `/api/cron/reminders` every 15 minutes. Vercel sends  
`Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set.

GitHub Actions (`.github/workflows/reminders.yml`) can remain as a backup ping — point URLs at your Vercel `APP_URL`.

## Local development

```bash
npm install
npm run dev    # http://localhost:3000 — uses .data/db.json
npm test
```

No KV/Blob tokens needed locally.

## Promotion policy

1. Test on **Preview** deploys first.
2. **Production** is founder true-source — `/api/reset` is disabled when `JEREMYOS_ENV=prod` or `VERCEL_ENV=production`.
3. Prod deploys never wipe KV/Blob data; only code changes.

## Legacy Fly (deprecated)

Fly configs (`fly.dev.toml`, `fly.prod.toml`) and the Fly deploy workflow are kept for reference during cutover. After Vercel is verified, decommission `rebuild-prod` on Fly.io.

Previous prod URL (until DNS moves): https://rebuild-prod.fly.dev
