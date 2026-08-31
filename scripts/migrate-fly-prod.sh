#!/usr/bin/env bash
# Migrate JeremyOS prod → jeremyos-prod on Fly.io
#
# Modes:
#   Default — export from OLD_APP (rebuild-prod), deploy, import, copy secrets
#   SKIP_OLD=1 — skip legacy app; use DB_BACKUP file or repo .data/db.json
#   IMPORT_ONLY=1 — only import DB_BACKUP into running jeremyos-prod
set -euo pipefail

export PATH="${HOME}/.fly/bin:${PATH}"

OLD_APP="${OLD_APP:-rebuild-prod}"
NEW_APP="${NEW_APP:-jeremyos-prod}"
NEW_VOL="${NEW_VOL:-jeremyos_prod_data}"
REGION="${REGION:-sjc}"
SKIP_OLD="${SKIP_OLD:-0}"
IMPORT_ONLY="${IMPORT_ONLY:-0}"
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

scale_to_one() {
  log "Scaling $NEW_APP to 1 machine (single volume) …"
  fly_cmd scale count 1 -a "$NEW_APP" || true
}

resolve_backup() {
  if [ -f "$DB_BACKUP" ]; then
    return 0
  fi
  if [ -f "$REPO_ROOT/.data/db.json" ]; then
    DB_BACKUP="$REPO_ROOT/.data/db.json"
    log "Using repo backup $DB_BACKUP"
    return 0
  fi
  return 1
}

export_db() {
  if [ "$SKIP_OLD" = "1" ]; then
    if resolve_backup; then
      python3 -c "import json; json.load(open('$DB_BACKUP'))"
      log "Using existing backup ($(wc -c < "$DB_BACKUP") bytes)"
      return 0
    fi
    echo "SKIP_OLD=1 but no DB_BACKUP and no $REPO_ROOT/.data/db.json"
    exit 1
  fi
  if ! app_exists "$OLD_APP"; then
    log "$OLD_APP gone — trying local backup"
    if resolve_backup; then
      python3 -c "import json; json.load(open('$DB_BACKUP'))"
      log "Using existing backup ($(wc -c < "$DB_BACKUP") bytes)"
      return 0
    fi
    echo "Cannot export from $OLD_APP and no local backup found"
    exit 1
  fi
  log "Exporting db.json from $OLD_APP …"
  fly_cmd ssh console -a "$OLD_APP" -C "cat /app/.data/db.json" > "$DB_BACKUP"
  python3 -c "import json; json.load(open('$DB_BACKUP'))"
  log "Backup OK ($(wc -c < "$DB_BACKUP") bytes)"
}

deploy_new() {
  log "Deploying to $NEW_APP (--ha=false) …"
  cd "$REPO_ROOT"
  fly_cmd deploy -c fly.prod.toml -a "$NEW_APP" --ha=false
}

import_db() {
  log "Importing db.json into $NEW_APP …"
  fly_cmd ssh console -a "$NEW_APP" -C "sh -c 'cat > /app/.data/db.json'" < "$DB_BACKUP"
}

copy_secrets() {
  if [ "$SKIP_OLD" = "1" ] || ! app_exists "$OLD_APP"; then
    log "Skipping secret copy — set manually on $NEW_APP (see DEPLOY.md)"
    return 0
  fi
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
  if [ "$SKIP_OLD" = "1" ] || ! app_exists "$OLD_APP"; then
    return 0
  fi
  log "Destroying legacy app $OLD_APP …"
  fly_cmd apps destroy "$OLD_APP" --yes
  log "Retired $OLD_APP"
}

main() {
  if [ "$IMPORT_ONLY" = "1" ]; then
    resolve_backup || { echo "IMPORT_ONLY needs DB_BACKUP or .data/db.json"; exit 1; }
    import_db
    verify_new
    log "Import complete → https://${NEW_APP}.fly.dev"
    return 0
  fi
  create_app_if_needed
  scale_to_one
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
