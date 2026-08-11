# Fly.io deployment

Two private stable apps with **separate persistent volumes**:

| Env | App name | Config | Data volume | URL |
|---|---|---|---|---|
| Dev | `rebuild-dev` | `fly.dev.toml` | `rebuild_dev_data` | https://rebuild-dev.fly.dev |
| Prod | `rebuild-prod` | `fly.prod.toml` | `rebuild_prod_data` | https://rebuild-prod.fly.dev |

## Promotion policy (locked)

1. **Dev** is for experiments and sample data. Reset allowed.
2. **Prod** is founder true-source history.  
   - `/api/reset` is **disabled** when `REBUILD_ENV=prod`.  
   - Deploys use the existing Fly volume — **code updates never wipe `.data/db.json`**.  
   - Only promote to prod when intentionally shipping; do not treat prod like a scratch pad.
3. Agent / release process promotes to prod. Casual local deploys should target **dev** first.

## Deploy

```bash
# Dev (test / sample data) — iterate here
fly deploy -c fly.dev.toml -a rebuild-dev

# Prod (founder true-source) — promote only when ready
fly deploy -c fly.prod.toml -a rebuild-prod
```

Volumes stay attached across deploys. Do **not** destroy `rebuild_prod_data`.

## One-time setup (already done)

```bash
fly apps create rebuild-dev
fly apps create rebuild-prod
fly volumes create rebuild_dev_data --region sjc --size 1 -a rebuild-dev
fly volumes create rebuild_prod_data --region sjc --size 1 -a rebuild-prod
```
