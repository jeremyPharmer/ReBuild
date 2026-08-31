# Fly.io deployment

Two private stable apps with **separate persistent volumes**:

| Env | App name | Config | Data volume | URL |
|---|---|---|---|---|
| Dev | `jeremyos-dev` | `fly.dev.toml` | `jeremyos_dev_data` | https://jeremyos-dev.fly.dev |
| Prod | `jeremyos-prod` | `fly.prod.toml` | `jeremyos_prod_data` | https://jeremyos-prod.fly.dev |

Legacy apps `rebuild-dev` / `rebuild-prod` may still exist until migrated.

**Interim prod deploy (until `jeremyos-prod` app is created):**

```bash
fly deploy -c fly.prod.toml -a rebuild-prod
```

Keep `[mounts] source = 'rebuild_prod_data'` in `fly.prod.toml` while on `rebuild-prod`. Set `APP_URL=https://rebuild-prod.fly.dev` until you cut over to `jeremyos-prod.fly.dev`.

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
# Dev (test / sample data) — iterate here
fly deploy -c fly.dev.toml -a jeremyos-dev

# Prod (founder true-source) — promote only when ready
fly deploy -c fly.prod.toml -a jeremyos-prod
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
fly deploy -c fly.prod.toml -a jeremyos-prod
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
Workflow: `.github/workflows/reminders.yml` (hourly + manual dispatch).

### In-app

Settings → Email nudges → set email, enable, choose hours (profile timezone) → **Test morning / Test evening**.
