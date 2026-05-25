#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: scripts/restore.sh backups/backup-YYYYmmdd-HHMMSS.tar.gz" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE="$1"

if [ ! -f "$ARCHIVE" ]; then
  echo "Archive not found: $ARCHIVE" >&2
  exit 1
fi

tar -xzf "$ARCHIVE" -C "$ROOT_DIR"

echo "Restored $ARCHIVE"
echo "Run: docker compose up -d --build"
