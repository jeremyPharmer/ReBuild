# Fly.io deployment

Two private stable apps with **separate persistent volumes**:

| Env | App name | Config | Data volume | URL |
|---|---|---|---|---|
| Dev | `rebuild-dev` | `fly.dev.toml` | `rebuild_dev_data` | https://rebuild-dev.fly.dev |
| Prod | `rebuild-prod` | `fly.prod.toml` | `rebuild_prod_data` | https://rebuild-prod.fly.dev |

## Promotion policy (locked)

1. **Dev** is for experiments and sample data. Reset allowed (`POST /api/reset`).
2. **Prod** is founder true-source history.
   - `/api/reset` is **disabled** when `REBUILD_ENV=prod`.
   - Deploys use the existing Fly volume — **code updates never wipe `.data/db.json`**.
   - Only promote to prod when intentionally shipping; do not treat prod like a scratch pad.
3. Verify on **dev** first, then promote to **prod**.
4. Do **not** destroy `rebuild_prod_data`.

## Deploy

```bash
# Dev (test / sample data) — iterate here
fly deploy -c fly.dev.toml -a rebuild-dev

# Prod (founder true-source) — promote only when ready
fly deploy -c fly.prod.toml -a rebuild-prod
```

## One-time setup (already done)

```bash
fly apps create rebuild-dev
fly apps create rebuild-prod
fly volumes create rebuild_dev_data --region sjc --size 1 -a rebuild-dev
fly volumes create rebuild_prod_data --region sjc --size 1 -a rebuild-prod
```

## Prod Day-1 restart (emergency only)

If founder explicitly requests a clean prod restart (not a normal deploy):

```bash
fly ssh console -a rebuild-prod -C "sh -c 'printf \"%s\" \"{...empty state...}\" > /app/.data/db.json'"
```

Never use this as part of routine promotion.

## Email reminders (morning / evening)

N=1 Start-the-day and Close-the-day emails via [Resend](https://resend.com).

### Secrets (prod + optionally dev)

```bash
# Resend API key (https://resend.com/api-keys)
fly secrets set RESEND_API_KEY=re_xxx -a rebuild-prod
fly secrets set RESEND_API_KEY=re_xxx -a rebuild-dev

# Shared cron bearer (any long random string)
fly secrets set CRON_SECRET='long-random-string' -a rebuild-prod
fly secrets set CRON_SECRET='long-random-string' -a rebuild-dev
```

Optional:

```bash
fly secrets set EMAIL_FROM='REBUILD <you@yourdomain.com>' -a rebuild-prod
fly secrets set APP_URL=https://rebuild-prod.fly.dev -a rebuild-prod
```

Until you verify a domain in Resend, use the default `onboarding@resend.dev` from-address (can only send to your Resend account email).

### GitHub Actions schedule

Repo secret **`REBUILD_CRON_SECRET`** must match Fly `CRON_SECRET`.  
Workflow: `.github/workflows/reminders.yml` (hourly + manual dispatch).

### In-app

Settings → Email nudges → set email, enable, choose hours (profile timezone) → **Test morning / Test evening**.
