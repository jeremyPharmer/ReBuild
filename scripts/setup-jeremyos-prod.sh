#!/usr/bin/env bash
# One-shot jeremyos-prod setup: volume + deploy + optional db import.
# Run on your laptop after: fly auth login
#
# Usage:
#   ./scripts/setup-jeremyos-prod.sh
#   DB_BACKUP=./db.json ./scripts/setup-jeremyos-prod.sh
set -euo pipefail

export PATH="${HOME}/.fly/bin:${PATH}"

APP="${APP:-jeremyos-prod}"
VOL="${VOL:-jeremyos_prod_data}"
REGION="${REGION:-sjc}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_BACKUP="${DB_BACKUP:-}"

fly_cmd() {
  if command -v fly >/dev/null 2>&1; then fly "$@"; else flyctl "$@"; fi
}

log() { echo "==> $*"; }

log "App: $APP  Volume: $VOL  Region: $REGION"

if ! fly_cmd status -a "$APP" >/dev/null 2>&1; then
  echo "App $APP not found. Create it first: fly apps create $APP --org personal"
  exit 1
fi

log "Scaling to 1 machine (JeremyOS uses one volume) …"
fly_cmd scale count 1 -a "$APP" || true

if ! fly_cmd volumes list -a "$APP" 2>/dev/null | grep -q "$VOL"; then
  log "Creating volume $VOL …"
  fly_cmd volumes create "$VOL" --region "$REGION" --size 1 -a "$APP" --yes
else
  log "Volume $VOL already exists"
fi

log "Deploying (--ha=false = single machine/volume) …"
cd "$REPO_ROOT"
fly_cmd deploy -c fly.prod.toml -a "$APP" --ha=false

if [ -n "$DB_BACKUP" ] && [ -f "$DB_BACKUP" ]; then
  log "Importing $DB_BACKUP …"
  python3 -c "import json; json.load(open('$DB_BACKUP'))"
  fly_cmd ssh console -a "$APP" -C "sh -c 'cat > /app/.data/db.json'" < "$DB_BACKUP"
  fly_cmd ssh console -a "$APP" -C "wc -c /app/.data/db.json"
fi

log "Done. Open https://${APP}.fly.dev/login"
log "Set secrets if not already: AUTH_SECRET CRON_SECRET RESEND_API_KEY EMAIL_FROM APP_URL"
