# Phone + browser only (no laptop)

Use this if you **cannot run terminal commands**. The Fly dashboard does **not** have a “Create volume” button — volumes are created via deploy tooling. From a phone you have two paths: **GitHub Actions** (recommended) or **Fly dashboard** checks + redeploy.

---

## Path A — GitHub Actions from your phone (recommended)

This creates the volume, scales to 1 machine, and deploys — all from the browser.

### One-time: add Fly token to GitHub

You need **`FLY_API_TOKEN`** in GitHub once. If you already added it for deploys, skip to “Run setup.”

1. On any device where you can open Fly: https://fly.io/user/personal_access_tokens  
   (Or Fly dashboard → your name → **Access Tokens**)
2. **Create token** → copy it (starts with `fo1_` or `FlyV1`)
3. On phone browser: https://github.com/jeremyPharmer/ReBuild/settings/secrets/actions
4. **New repository secret**
   - Name: `FLY_API_TOKEN`
   - Value: paste token → **Add secret**

### Merge the setup workflow (once)

PR **#80** adds the **Setup jeremyos-prod** workflow. Merge it on GitHub (phone):

1. https://github.com/jeremyPharmer/ReBuild/pull/80
2. **Merge pull request**

### Run setup from phone

1. https://github.com/jeremyPharmer/ReBuild/actions/workflows/setup-jeremyos-prod.yml
2. Tap **Run workflow** (gray button, top right)
3. Branch: **main** → green **Run workflow**
4. Wait ~3–5 min → tap the run → watch steps turn green

When **Smoke test login page** is green, open:

**https://jeremyos-prod.fly.dev/login**

You should see **JeremyOS**, not 502.

---

## Path B — Fly dashboard only (fix 502 / check state)

Use this to **inspect** and **restart**; volume creation still needs Path A unless a volume already exists.

### 1. Open the app

https://fly.io/apps/jeremyos-prod

### 2. Machines tab

1. Left menu → **Machines**
2. You want **1 machine**, region **sjc**
3. Tap the machine row

| What you see | What to do |
|---|---|
| State **stopped** | Tap **Start** (or **Restart**) |
| State **started** but site 502 | Open **Logs** (below) |
| **2 machines** | Tap one → **⋯** → **Destroy** (keep 1 in sjc) |
| Status **Suspended** | Org **Billing** → add card → back here → **Start** |

On the machine detail page, scroll for **Volume** / **Mounts**. You want:

- Name: `jeremyos_prod_data`
- Path: `/app/.data`

If **no volume listed** → use **Path A** (GitHub Actions setup).

### 3. Volumes tab

1. Left menu → **Volumes**

| What you see | Meaning |
|---|---|
| Row `jeremyos_prod_data`, sjc, **Attached VM** filled | Good — volume is on the machine |
| Row exists, **Attached VM** empty | Run Path A or **Machines → Restart** |
| “No volumes” | Run Path A — dashboard cannot create volumes |

### 4. Logs & Errors tab

1. Left menu → **Logs & Errors**
2. Look at the last red / error lines

| Log message | Fix |
|---|---|
| `needs volumes with name 'jeremyos_prod_data'` | Path A — setup workflow |
| `payment method` | Fly → **Billing** → add card |
| `EACCES` / `.data` | Volume not mounted — Path A |
| `Error: listen` / crash loop | Screenshot logs and send |

### 5. Secrets tab (browser — no laptop)

1. Left menu → **Secrets**
2. **New secret** (or **Add secret**) for each:

| Secret name | Value (example) |
|---|---|
| `AUTH_SECRET` | Long random string (any 32+ chars) |
| `CRON_SECRET` | Another long random string |
| `APP_URL` | `https://jeremyos-prod.fly.dev` |
| `EMAIL_FROM` | `JeremyOS <noreply@icanrebuild.com>` |
| `RESEND_API_KEY` | Your `re_…` key (optional until email works) |

3. After adding secrets, go **Machines** → **Restart**

You can type random secrets on your phone — e.g. two different long passwords.

### 6. Test in browser

Open **https://jeremyos-prod.fly.dev/login**

- **JeremyOS page** = done  
- **502 / 503** = send screenshots of **Machines**, **Volumes**, and **Logs**

---

## Path C — Redeploy from phone (after volume exists)

If **Volumes** already shows `jeremyos_prod_data` attached:

1. https://github.com/jeremyPharmer/ReBuild/actions/workflows/deploy.yml
2. **Run workflow**
3. Target: **prod**
4. Wait for green checkmark

---

## Checklist (phone)

- [ ] Billing / card on Fly (if app was Suspended)
- [ ] **1** machine in **sjc**
- [ ] Volume **`jeremyos_prod_data`** attached
- [ ] Secrets: at least `AUTH_SECRET`, `CRON_SECRET`, `APP_URL`
- [ ] GitHub **Setup jeremyos-prod** workflow green OR **Deploy → prod** green
- [ ] https://jeremyos-prod.fly.dev/login loads

---

## What I cannot do from your phone

- **Import old `db.json`** — needs SSH/terminal. Without a laptop, prod will start **empty** (re-onboard) unless we add a custom restore later.
- **Create volumes in Fly web UI** — Fly expects CLI or GitHub Actions; that’s why Path A exists.

After login works, tell me if you need founder data restored — we can plan a one-time import when you have any terminal access, or add a guarded admin API for restore.
