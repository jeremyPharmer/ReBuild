# JeremyOS prod — 3 steps (phone only)

Your machine keeps **Stopping** because it was created with **256MB RAM**. JeremyOS needs **512MB**. It tries to start, runs out of memory, and dies. **Not your fault.**

---

## Step 1 — GitHub secret (one time, ~2 min)

1. https://fly.io/user/personal_access_tokens → **Create token** → copy  
2. https://github.com/jeremyPharmer/ReBuild/settings/secrets/actions  
3. **New secret** → name `FLY_API_TOKEN` → paste → Save  

*(Skip if already there.)*

---

## Step 2 — Merge the fix (one time)

1. https://github.com/jeremyPharmer/ReBuild/pull/80  
2. **Merge pull request**

---

## Step 3 — One button fix

1. https://github.com/jeremyPharmer/ReBuild/actions/workflows/setup-jeremyos-prod.yml  
2. **Run workflow** → branch **main** → **Run workflow**  
3. Wait until all steps are green (~5 min)

Open **https://jeremyos-prod.fly.dev/login** — should show JeremyOS.

---

## Optional — start machine by hand (after Step 3)

If the site still 502:

1. https://fly.io/apps/jeremyos-prod/machines  
2. Tap the machine  
3. Tap the **▶ Play** button (top right)  
4. Confirm **512MB** (not 256MB) on the machine page  

---

## Still stuck?

Send a screenshot of **Logs & Errors** in the Fly app.

Do **not** delete the app — Step 3 resets machines safely.
