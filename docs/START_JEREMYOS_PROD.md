# JeremyOS prod — browser only (no terminal)

Everything below is done in **Chrome/Safari/Firefox**. No laptop terminal, no phone required.

**Why the machine keeps stopping:** it was created with **256MB RAM**. JeremyOS needs **512MB**. It starts, runs out of memory, and Fly marks it **Stopped**. The automated fix below redeploys with 512MB.

---

## Part 1 — Fly billing (if app shows “Suspended”)

1. Open https://fly.io/dashboard  
2. Click your org name (**Jeremy Schrader** / **Personal**) in the top-left  
3. Click **Billing**  
4. Add a payment method if none is on file  
   - You usually stay within Fly’s free allowance (~$5/mo credit)  
   - A card is required for volumes and to unsuspend apps  

---

## Part 2 — Create a Fly access token

1. Open https://fly.io/user/personal_access_tokens  
2. Click **Create token** (or **Create access token**)  
3. Name it something like `github-jeremyos`  
4. Click **Create** → **Copy** the token (starts with `fo1_` or similar)  
5. Keep this tab open or paste the token somewhere temporary — you’ll use it once in Part 3  

---

## Part 3 — Add token to GitHub

1. Open https://github.com/jeremyPharmer/ReBuild/settings/secrets/actions  
2. Click **New repository secret**  
3. **Name:** `FLY_API_TOKEN`  
4. **Secret:** paste the Fly token from Part 2  
5. Click **Add secret**  

*(If `FLY_API_TOKEN` already exists, click it → **Update secret** → paste the new token.)*

---

## Part 4 — Merge the fix into main

This adds the **Fix jeremyos-prod** GitHub Action (volume + 512MB deploy).

1. Open https://github.com/jeremyPharmer/ReBuild/pull/80  
2. Click **Merge pull request**  
3. Click **Confirm merge**  

---

## Part 5 — Run the fix (one click)

1. Open https://github.com/jeremyPharmer/ReBuild/actions/workflows/setup-jeremyos-prod.yml  
2. Click **Run workflow** (dropdown on the right)  
3. Branch: **main**  
4. Click the green **Run workflow** button  
5. Wait ~30 seconds, then **refresh the page**  
6. Click the new workflow run at the top of the list  
7. Wait until every step has a green checkmark (~3–6 minutes)  

**What this does automatically (you don’t run these — GitHub does):**

- Stops broken machines  
- Creates volume `jeremyos_prod_data` in **sjc** if missing  
- Deploys with **512MB RAM**  
- Checks https://jeremyos-prod.fly.dev/login  

If **Wait for login page** fails, continue to Part 6–8 anyway.

---

## Part 6 — Set app secrets in Fly (browser)

1. Open https://fly.io/apps/jeremyos-prod  
2. Left sidebar → **Secrets**  
3. For each row below, click **New secret** (or **Add secret**), enter name + value, save:

| Secret name | Value |
|-------------|--------|
| `AUTH_SECRET` | Any long random string (e.g. 40 random letters/numbers) |
| `CRON_SECRET` | A different long random string |
| `APP_URL` | `https://jeremyos-prod.fly.dev` |
| `EMAIL_FROM` | `JeremyOS <noreply@icanrebuild.com>` |
| `RESEND_API_KEY` | Your Resend key (`re_…`) — optional until email works |

4. After saving secrets, go to **Machines** → click your machine → click **Restart** (or **▶ Start**)

---

## Part 7 — Verify in Fly dashboard

### Machines

1. https://fly.io/apps/jeremyos-prod/machines  
2. You want **exactly 1 machine**  
3. Click the machine → check:
   - **State:** `started` (if `stopped`, click **▶ Start**)  
   - **Region:** `sjc`  
   - **Size:** **512MB** (not 256MB)  
   - **Volume:** `jeremyos_prod_data` mounted at `/app/.data`  

If you still see **256MB** after Part 5, run Part 5 again (workflow redeploys with 512MB).

### Volumes

1. https://fly.io/apps/jeremyos-prod/volumes  
2. You should see **`jeremyos_prod_data`**, region **sjc**, with an **Attached VM** (not blank)  

If **No volumes**, run Part 5 again.

### Logs (if something’s wrong)

1. https://fly.io/apps/jeremyos-prod/monitoring (or **Logs & Errors** in sidebar)  
2. Read the latest errors (OOM, payment, volume missing, etc.)

---

## Part 8 — Open the site

1. Open https://jeremyos-prod.fly.dev/login  
2. Success = **JeremyOS** login page  
3. Failure = 502/503 → Part 7 **Logs**, or run Part 5 again  

---

## Part 9 — Optional: cron email secret in GitHub

Only if you use morning/evening email nudges:

1. https://github.com/jeremyPharmer/ReBuild/settings/secrets/actions  
2. **New repository secret** → `JEREMYOS_CRON_SECRET` → same value as Fly `CRON_SECRET`  
3. Optional: `JEREMYOS_APP_URL` = `https://jeremyos-prod.fly.dev`  

---

## Quick checklist

- [ ] Fly billing / card on file (if was Suspended)  
- [ ] GitHub secret `FLY_API_TOKEN`  
- [ ] PR #80 merged  
- [ ] **Fix jeremyos-prod** workflow green  
- [ ] Fly secrets: `AUTH_SECRET`, `CRON_SECRET`, `APP_URL`  
- [ ] 1 machine, **512MB**, **sjc**, volume attached  
- [ ] https://jeremyos-prod.fly.dev/login works  

---

## Do not

- Delete `jeremyos-prod` unless you want to lose the app name and start completely over  
- Create the app in Toronto (**yyz**) — use **sjc** only  

---

## Redeploy later (browser only)

After code changes are merged to `main`:

1. https://github.com/jeremyPharmer/ReBuild/actions/workflows/deploy.yml  
2. **Run workflow** → target **prod** → **Run workflow**  

---

## Founder data (db.json)

Restoring old journey data needs a terminal (`fly ssh` + file upload). Without that, prod starts **empty** and you can sign up fresh once login works. Ask for a one-time import when you have terminal access.
