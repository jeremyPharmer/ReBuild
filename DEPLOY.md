# Fly.io deployment

Two private stable apps:

| Env | App name | Config | Data volume |
|---|---|---|---|
| Dev | `rebuild-dev` | `fly.dev.toml` | `rebuild_dev_data` |
| Prod | `rebuild-prod` | `fly.prod.toml` | `rebuild_prod_data` |

## One-time setup (on your machine / CI with Fly token)

```bash
# Install CLI: https://fly.io/docs/hands-on/install-flyctl/
fly auth login

# Create apps (names must be free on Fly)
fly apps create rebuild-dev
fly apps create rebuild-prod

# Persistent JSON store volumes
fly volumes create rebuild_dev_data --region sjc --size 1 -a rebuild-dev
fly volumes create rebuild_prod_data --region sjc --size 1 -a rebuild-prod
```

## Deploy

```bash
# Dev (test / sample data)
fly deploy -c fly.dev.toml -a rebuild-dev

# Prod (founder true-source data) — only when ready
fly deploy -c fly.prod.toml -a rebuild-prod
```

URLs:

- **Dev:** https://rebuild-dev.fly.dev — test / sample data  
- **Prod:** https://rebuild-prod.fly.dev — founder true-source data  

Separate volumes so data never crosses.
