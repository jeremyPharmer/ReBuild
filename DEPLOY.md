# Fly.io deployment

JeremyOS runs on **Fly.io** with a persistent volume at `/app/.data/db.json`.

## Current state (2026-08-31)

| | App | URL | Volume |
|---|---|---|---|
| **Prod** | `jeremyos-prod` | https://jeremyos-prod.fly.dev | `jeremyos_prod_data` |

Legacy `rebuild-prod` was retired. Founder data is restored from backup into `jeremyos-prod` after migration.

### Emergency recovery (if prod is down)

**Stuck adding a volume?** See [`docs/FLY_VOLUME_SETUP.md`](docs/FLY_VOLUME_SETUP.md)  
**Phone + browser only (no laptop)?** See [`docs/FLY_PHONE_SETUP.md`](docs/FLY_PHONE_SETUP.md)

Founder `db.json` was backed up before migration. On your laptop:

```bash
fly auth login
fly apps create jeremyos-prod
fly volumes create jeremyos_prod_data --region sjc --size 1 -a jeremyos-prod --yes
git clone … && cd ReBuild
fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false
fly ssh console -a jeremyos-prod -C "sh -c 'cat > /app/.data/db.json'" < /path/to/db.json
fly secrets set AUTH_SECRET='…' CRON_SECRET='…' RESEND_API_KEY='…' \
  EMAIL_FROM='JeremyOS <noreply@icanrebuild.com>' \
  APP_URL='https://jeremyos-prod.fly.dev' -a jeremyos-prod
```

Or from repo root (with full org Fly token): `npm run migrate:fly-prod`

## Target environments

| Env | App name | Config | Data volume | URL |
|---|---|---|---|---|
| Dev | `jeremyos-dev` | `fly.dev.toml` | `jeremyos_dev_data` | https://jeremyos-dev.fly.dev |
| Prod | `jeremyos-prod` | `fly.prod.toml` | `jeremyos_prod_data` | https://jeremyos-prod.fly.dev |

## Change the URL

Fly **cannot rename** an app. The app name sets the default `https://<app>.fly.dev` URL. Two paths:

### A — New Fly app (`jeremyos-prod.fly.dev`)

Run on your laptop with `fly auth login`:

```bash
# 1. Create app + volume
fly apps create jeremyos-prod
fly volumes create jeremyos_prod_data --region sjc --size 1 -a jeremyos-prod

# 2. Export founder data from legacy prod
fly ssh console -a rebuild-prod -C "cat /app/.data/db.json" > /tmp/db.json

# 3. Deploy (from repo root)
fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false

# 4. Import data
fly ssh console -a jeremyos-prod -C "sh -c 'cat > /app/.data/db.json'" < /tmp/db.json

# 5. Secrets (copy values from rebuild-prod)
fly secrets set \
  AUTH_SECRET='…' \
  CRON_SECRET='…' \
  RESEND_API_KEY='…' \
  EMAIL_FROM='JeremyOS <noreply@icanrebuild.com>' \
  APP_URL='https://jeremyos-prod.fly.dev' \
  -a jeremyos-prod
```

Then in the repo:
- Set `fly.prod.toml` `[mounts] source = 'jeremyos_prod_data'`
- Set GitHub secret **`JEREMYOS_APP_URL`** = `https://jeremyos-prod.fly.dev`
- Update bookmarks; decommission `rebuild-prod` when verified

### B — Custom domain (keep `rebuild-prod` app)

Best if you own a domain (e.g. `jeremyos.yourdomain.com`):

```bash
fly certs add jeremyos.yourdomain.com -a rebuild-prod
# Add the DNS record Fly prints (usually CNAME → rebuild-prod.fly.dev)

fly secrets set APP_URL='https://jeremyos.yourdomain.com' -a rebuild-prod
```

Set GitHub secret **`JEREMYOS_APP_URL`** to the same URL. Email links and cron use `APP_URL`, not the Fly app name.

The old `https://rebuild-prod.fly.dev` URL keeps working unless you remove it.

---

**Interim prod deploy (while still on `rebuild-prod`):**

```bash
fly deploy -c fly.prod.toml -a rebuild-prod
```

Keep `[mounts] source = 'rebuild_prod_data'` in `fly.prod.toml` until you cut over to `jeremyos-prod`.

## Promotion policy (locked)

1. **Dev** is for experiments and sample data. Reset allowed (`POST /api/reset`).
2. **Prod** is founder true-source history.
   - `/api/reset` is **disabled** when `JEREMYOS_ENV=prod`.
   - Deploys use the existing Fly volume — **code updates never wipe `.data/db.json`**.
   - Only promote to prod when intentionally shipping; do not treat prod like a scratch pad.
3. Verify on **dev** first, then promote to **prod**.
4. Do **not** destroy `jeremyos_prod_data`.

## Deploy

```bash
# Dev (when jeremyos-dev exists)
fly deploy -c fly.dev.toml -a jeremyos-dev

# Prod — use rebuild-prod until jeremyos-prod is created (see "Change the URL")
fly deploy -c fly.prod.toml -a rebuild-prod

# Prod — after URL migration
fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false
```

GitHub Actions: **Actions → Deploy → Run workflow** (`both` / `dev` / `prod`).
Requires repo secret `FLY_API_TOKEN` (same value as Cursor secret below).

## Cloud agent / CI auth (`FLY_API_TOKEN`)

Cloud agents and the Deploy workflow need a Fly API token in the environment as
**`FLY_API_TOKEN`**. Interactive `fly auth login` does not work in this VM.

### Diagnose

In the agent shell:

```bash
# Name is registered but value missing → secret empty or needs agent restart
echo "names=$CLOUD_AGENT_INJECTED_SECRET_NAMES"
[ -n "${FLY_API_TOKEN:-}" ] && echo "FLY_API_TOKEN ok" || echo "FLY_API_TOKEN MISSING"
```

If the name appears in `CLOUD_AGENT_INJECTED_SECRET_NAMES` but `FLY_API_TOKEN`
is unset, the Cursor secret exists **without a usable value** (or the agent
started before the value was saved). Fix below, then **start a new Cloud Agent**.

### Mint a token (on your laptop, once)

```bash
fly auth login
# Org token can deploy both jeremyos-dev and jeremyos-prod:
fly tokens create org -o personal -n "cursor-jeremyos-deploy" -x 2160h
# (use your real org slug from `fly orgs list` if not "personal")
```

Copy the printed token (starts with `FlyV1` / `fo1_…`). Do **not** commit it.

### Install the token where agents can use it

1. **Cursor Cloud Secrets** (required for this agent):
   [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents)
   → Secrets → add / update **`FLY_API_TOKEN`** = the token value → save.
2. **GitHub Actions** (optional, for Actions → Deploy):
   Repo → Settings → Secrets and variables → Actions →
   **`FLY_API_TOKEN`** = same value.
3. **Restart**: start a **new** Cloud Agent after saving. Existing VMs do not
   pick up secret value changes mid-run.

Then the agent can run:

```bash
fly deploy -c fly.dev.toml -a jeremyos-dev
fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false
```

## One-time setup (JeremyOS apps)

If migrating from `rebuild-*` apps, create new Fly apps and volumes:

```bash
fly apps create jeremyos-dev
fly apps create jeremyos-prod
fly volumes create jeremyos_dev_data --region sjc --size 1 -a jeremyos-dev
fly volumes create jeremyos_prod_data --region sjc --size 1 -a jeremyos-prod
```

Copy `/app/.data/db.json` from the old prod volume if you need to preserve founder data, then point `APP_URL` and DNS bookmarks at the new URLs.

## Prod Day-1 restart (emergency only)

If founder explicitly requests a clean prod restart (not a normal deploy):

```bash
fly ssh console -a jeremyos-prod -C "sh -c 'printf \"%s\" \"{...empty state...}\" > /app/.data/db.json'"
```

Never use this as part of routine promotion.

## Email reminders (morning / evening)

N=1 Start-the-day and Close-the-day emails via [Resend](https://resend.com).

### Secrets (prod + optionally dev)

```bash
# Resend API key (https://resend.com/api-keys)
fly secrets set RESEND_API_KEY=re_xxx -a jeremyos-prod
fly secrets set RESEND_API_KEY=re_xxx -a jeremyos-dev

# Shared cron bearer (any long random string)
fly secrets set CRON_SECRET='long-random-string' -a jeremyos-prod
fly secrets set CRON_SECRET='long-random-string' -a jeremyos-dev
```

Optional:

```bash
fly secrets set EMAIL_FROM='JeremyOS <you@yourdomain.com>' -a jeremyos-prod
fly secrets set APP_URL=https://jeremyos-prod.fly.dev -a jeremyos-prod
```

Until you verify a domain in Resend, use the default `onboarding@resend.dev` from-address (can only send to your Resend account email).

### GitHub Actions schedule

Repo secret **`JEREMYOS_CRON_SECRET`** must match Fly `CRON_SECRET` (legacy `REBUILD_CRON_SECRET` still works until rotated).  
Optional **`JEREMYOS_APP_URL`** — prod reminder target (defaults to `https://rebuild-prod.fly.dev` until you migrate).  
Workflow: `.github/workflows/reminders.yml` (every 15 min + manual dispatch).

### In-app

Settings → Email nudges → set email, enable, choose hours (profile timezone) → **Test morning / Test evening**.
