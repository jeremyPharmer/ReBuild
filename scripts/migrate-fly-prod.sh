#!/usr/bin/env bash
# Migrate JeremyOS prod from rebuild-prod → jeremyos-prod on Fly.io
set -euo pipefail

export PATH="${HOME}/.fly/bin:${PATH}"

OLD_APP="${OLD_APP:-rebuild-prod}"
NEW_APP="${NEW_APP:-jeremyos-prod}"
NEW_VOL="${NEW_VOL:-jeremyos_prod_data}"
REGION="${REGION:-sjc}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_BACKUP="${DB_BACKUP:-/tmp/jeremyos-db.json}"

log() { echo "==> $*"; }

fly_cmd() {
  if command -v fly >/dev/null 2>&1; then fly "$@"; else flyctl "$@"; fi
}

app_exists() {
  fly_cmd apps list 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "$1"
}

volume_exists() {
  fly_cmd volumes list -a "$NEW_APP" 2>/dev/null | grep -q "$NEW_VOL"
}

create_app_if_needed() {
  if app_exists "$NEW_APP"; then
    log "$NEW_APP already exists"
    return 0
  fi
  log "Creating $NEW_APP …"
  fly_cmd apps create "$NEW_APP"
}

create_volume_if_needed() {
  if volume_exists; then
    log "Volume $NEW_VOL already on $NEW_APP"
    return 0
  fi
  log "Creating volume $NEW_VOL on $NEW_APP …"
  fly_cmd volumes create "$NEW_VOL" --region "$REGION" --size 1 -a "$NEW_APP" --yes
}

export_db() {
  log "Exporting db.json from $OLD_APP …"
  fly_cmd ssh console -a "$OLD_APP" -C "cat /app/.data/db.json" > "$DB_BACKUP"
  python3 -c "import json; json.load(open('$DB_BACKUP'))"
  log "Backup OK ($(wc -c < "$DB_BACKUP") bytes)"
}

deploy_new() {
  log "Deploying to $NEW_APP …"
  cd "$REPO_ROOT"
  fly_cmd deploy -c fly.prod.toml -a "$NEW_APP"
}

import_db() {
  log "Importing db.json into $NEW_APP …"
  fly_cmd ssh console -a "$NEW_APP" -C "sh -c 'cat > /app/.data/db.json'" < "$DB_BACKUP"
}

copy_secrets() {
  log "Copying secrets from $OLD_APP → $NEW_APP …"
  mapfile -t lines < <(
    fly_cmd ssh console -a "$OLD_APP" -C "printenv AUTH_SECRET CRON_SECRET RESEND_API_KEY EMAIL_FROM" 2>&1 \
      | grep -v "^Connecting to" | grep -v "^Error:" | grep -v "^$" || true
  )
  if [ "${#lines[@]}" -lt 4 ]; then
    echo "Could not read secrets from $OLD_APP (need 4 values, got ${#lines[@]})"
    exit 1
  fi
  fly_cmd secrets set \
    "AUTH_SECRET=${lines[0]}" \
    "CRON_SECRET=${lines[1]}" \
    "RESEND_API_KEY=${lines[2]}" \
    "EMAIL_FROM=${lines[3]}" \
    "APP_URL=https://${NEW_APP}.fly.dev" \
    -a "$NEW_APP"
}

verify_new() {
  log "Smoke test https://${NEW_APP}.fly.dev/login …"
  curl -fsS "https://${NEW_APP}.fly.dev/login" | grep -q JeremyOS
  log "JeremyOS branding OK on $NEW_APP"
}

retire_old() {
  log "Destroying legacy app $OLD_APP …"
  fly_cmd apps destroy "$OLD_APP" --yes
  log "Retired $OLD_APP"
}

main() {
  create_app_if_needed
  create_volume_if_needed
  export_db
  deploy_new
  import_db
  copy_secrets
  verify_new
  retire_old
  log "Migration complete → https://${NEW_APP}.fly.dev"
}

main "$@"
