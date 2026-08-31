# Fly volume setup for jeremyos-prod (detailed)

Use this when you created **`jeremyos-prod`** but cannot add a volume, deploy fails with “needs volumes with name…”, or you see **502** at https://jeremyos-prod.fly.dev.

JeremyOS prod needs **one persistent volume** mounted at `/app/.data` (your `db.json` lives there).

---

## What you are creating (exact values)

| Field | Value | Why |
|---|---|---|
| App name | `jeremyos-prod` | Sets URL `jeremyos-prod.fly.dev` |
| **Region** | **`sjc`** (San Jose) | Must match app primary region and old data |
| Volume name | **`jeremyos_prod_data`** | Must match `fly.prod.toml` `[mounts] source` |
| Size | **1 GB** | Enough for V1 |
| Machines | **1** (not 2) | One machine = one volume |

If the app was created in **Toronto (yyz)** or any region other than **sjc**, volumes in sjc will **not** attach. Fix in [Region wrong?](#region-wrong-start-over-in-sjc) below.

---

## Part 1 — Check region (phone or laptop browser)

1. Open https://fly.io/dashboard
2. Sign in
3. Tap/click **Apps** → **jeremyos-prod**
4. Open **Overview** (or **Machines**)

Look for **Region** on each machine (e.g. `sjc`, `yyz`, `lax`).

- **All machines show `sjc`** → continue to [Part 2](#part-2--create-the-volume-browser)
- **Any machine shows `yyz` or another region** → stop and do [Region wrong?](#region-wrong-start-over-in-sjc) first

Also check **Machines** count:

- **2 machines, 0 volumes** → this is the usual “can’t add volume / deploy broken” case. Fly wants **2 volumes** by default. JeremyOS only needs **1 machine + 1 volume** (see Part 3).

---

## Part 2 — Create the volume (browser)

### Step-by-step (Fly dashboard)

1. https://fly.io/dashboard → **Apps** → **jeremyos-prod**
2. Left sidebar → **Volumes** (sometimes under **Storage**)
3. Click **Create volume** (or **Add volume**)

Fill the form **exactly**:

| Form field | Enter |
|---|---|
| **Name** | `jeremyos_prod_data` |
| **Region** | `sjc` (San Jose, California) — **same as app machines** |
| **Size** | `1` GB |

4. Click **Create**

### After create — verify

On the Volumes list you should see:

- Name: `jeremyos_prod_data`
- Region: `sjc`
- **Attached VM**: empty/unattached **or** one machine ID (both OK before deploy)

If **Create volume** is missing, grayed out, or errors:

| Symptom | Fix |
|---|---|
| No **Volumes** in sidebar | App may be on wrong org — confirm you’re in **Jeremy Schrader / personal** |
| Region dropdown has no `sjc` | App primary region is not sjc — [fix region](#region-wrong-start-over-in-sjc) |
| “Payment method required” | Fly → **Account** → **Billing** → add card (volumes are paid storage, ~$0.15/GB/mo) |
| Error about capacity in `sjc` | Retry in a few minutes or pick same region as existing machines |
| Volume created but deploy still fails | Likely **2 machines** — go to [Part 3](#part-3--one-machine-not-two) |

---

## Part 3 — One machine, not two

Fly **deploy creates 2 machines by default** (high availability). Each machine needs its **own** volume. JeremyOS V1 uses **one** volume and **one** machine.

### Browser: remove extra machine

1. **Apps** → **jeremyos-prod** → **Machines**
2. If you see **2 machines**:
   - Keep one (prefer the one in **`sjc`**)
   - On the other → **⋯** → **Destroy machine** → confirm
3. You want **exactly 1 machine** before deploy

### Laptop (easier): scale + single-volume deploy

```bash
fly auth login
fly scale count 1 -a jeremyos-prod
fly volumes create jeremyos_prod_data --region sjc --size 1 -a jeremyos-prod --yes
```

Deploy with high availability **off** (only one volume):

```bash
cd /path/to/ReBuild
fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false
```

`--ha=false` is important: without it, deploy asks for a **second** volume.

---

## Part 4 — Orphan volume from old rebuild-prod (recover founder data)

Before migration, prod used app **`rebuild-prod`** and volume **`rebuild_prod_data`** in **`sjc`**.

1. Dashboard → **Volumes** (top level, not inside an app) **or** each app’s Volumes tab
2. Look for **`rebuild_prod_data`**, region **`sjc`**, status **unattached**

If it exists:

- You **cannot rename** a volume to `jeremyos_prod_data`
- Options:
  - **A (recommended):** Create new `jeremyos_prod_data`, deploy, then copy data from old volume via snapshot/fork (advanced), **or** import `db.json` backup ([Part 6](#part-6--restore-founder-dbjson))
  - **B:** Fork snapshot of `rebuild_prod_data` into new volume on `jeremyos-prod` (Fly docs: volume fork)

If you only see **`jeremyos_prod_data`** empty → use backup import in Part 6.

---

## Region wrong? Start over in sjc

Volumes **never** move regions. If `jeremyos-prod` is in **yyz** (Toronto):

1. **Export anything you need** (if app ever worked)
2. **Apps** → **jeremyos-prod** → **Settings** → **Delete app** (destroy all machines first if prompted)
3. Create fresh app in **sjc**:

```bash
fly auth login
fly apps create jeremyos-prod --org personal
fly volumes create jeremyos_prod_data --region sjc --size 1 -a jeremyos-prod --yes
```

4. Continue with deploy (Part 5)

---

## Part 5 — Deploy + secrets (laptop)

From repo root after volume exists:

```bash
git clone https://github.com/YOUR_ORG/ReBuild.git   # if needed
cd ReBuild
git checkout main   # or branch with jeremyos fly config

fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false

fly secrets set \
  AUTH_SECRET='YOUR_LONG_RANDOM_SECRET' \
  CRON_SECRET='YOUR_CRON_SECRET' \
  RESEND_API_KEY='re_xxx' \
  EMAIL_FROM='JeremyOS <noreply@icanrebuild.com>' \
  APP_URL='https://jeremyos-prod.fly.dev' \
  -a jeremyos-prod
```

Generate new secrets if you lost the old ones:

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 32   # CRON_SECRET
```

GitHub (for cron emails):

- **`FLY_API_TOKEN`** — org token from `fly tokens create org -o personal -n cursor-deploy -x 2160h`
- **`JEREMYOS_CRON_SECRET`** — same as Fly `CRON_SECRET`
- **`JEREMYOS_APP_URL`** — `https://jeremyos-prod.fly.dev`

Or: **GitHub → Actions → Deploy → Run workflow → prod** (after `FLY_API_TOKEN` is set).

Smoke test: open https://jeremyos-prod.fly.dev/login — should show **JeremyOS**, not 502.

---

## Part 6 — Restore founder db.json

If you have a backup file (e.g. exported before `rebuild-prod` was removed):

```bash
fly ssh console -a jeremyos-prod -C "sh -c 'cat > /app/.data/db.json'" < /path/to/db.json
```

Verify:

```bash
fly ssh console -a jeremyos-prod -C "wc -c /app/.data/db.json"
```

Should be tens of KB (founder data ~80KB), not 0.

Without backup: complete onboarding in the app once prod is up (fresh start).

---

## Part 7 — Let Cloud Agent finish next steps

The Cursor Cloud Agent token currently gets **`unauthorized`** for deploy on your apps. After you:

1. Create volume `jeremyos_prod_data` in **sjc**
2. Scale to **1** machine
3. Mint org token and save as Cursor secret **`FLY_API_TOKEN`**

…start a **new Cloud Agent** and ask it to deploy + import backup. It can run:

```bash
fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false
```

---

## Quick checklist

- [ ] App region = **sjc**
- [ ] Volume name = **jeremyos_prod_data**
- [ ] Volume region = **sjc**
- [ ] Machine count = **1**
- [ ] Deploy with **`--ha=false`**
- [ ] Secrets set on `jeremyos-prod`
- [ ] `db.json` imported (or fresh onboarding)
- [ ] https://jeremyos-prod.fly.dev/login works

---

## One paste block (laptop, sjc, single volume)

```bash
fly auth login
fly scale count 1 -a jeremyos-prod || true
fly volumes create jeremyos_prod_data --region sjc --size 1 -a jeremyos-prod --yes
cd /path/to/ReBuild && fly deploy -c fly.prod.toml -a jeremyos-prod --ha=false
# then secrets + db import as above
```
