#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$BACKUP_DIR/backup-$STAMP.tar.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR" "$ROOT_DIR/data/exports" "$ROOT_DIR/data/logs"

if command -v docker >/dev/null 2>&1; then
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T redis redis-cli BGSAVE >/dev/null 2>&1 || true
fi

if [ -f "$ROOT_DIR/.env" ]; then
  BACKUP_PATHS=".env data"
else
  BACKUP_PATHS="data"
  echo "Warning: .env not found; backup will include data/ only." >&2
fi

tar -czf "$ARCHIVE" -C "$ROOT_DIR" $BACKUP_PATHS 2>/dev/null || {
    echo "Backup failed. Make sure .env exists and data/ is readable." >&2
    exit 1
  }

find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "$ARCHIVE"
