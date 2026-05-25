#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$BACKUP_DIR/prod-redis-$STAMP.tar.gz"
TMP_ARCHIVE="$ARCHIVE.tmp"

PROD_SSH_USER="${PROD_SSH_USER:-root}"
PROD_SSH_HOST="${PROD_SSH_HOST:-156.239.236.174}"
PROD_SSH_PORT="${PROD_SSH_PORT:-2022}"
PROD_APP_DIR="${PROD_APP_DIR:-/opt/maopian-tools}"
PROD_REDIS_VOLUME="${PROD_REDIS_VOLUME:-maopian-tools_redis-data}"

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-$(basename "$ROOT_DIR")}"
LOCAL_REDIS_VOLUME="${LOCAL_REDIS_VOLUME:-${PROJECT_NAME}_redis-data}"

SSH_TARGET="$PROD_SSH_USER@$PROD_SSH_HOST"
SSH_OPTS="-p $PROD_SSH_PORT -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.local.yml" "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.local.yml" "$@"
  else
    echo "Docker Compose is required. Install Docker Desktop or docker-compose first." >&2
    exit 1
  fi
}

need_command docker
need_command ssh

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Checking production Redis..."
ssh $SSH_OPTS "$SSH_TARGET" "cd '$PROD_APP_DIR' && COMPOSE='docker compose'; if command -v docker-compose >/dev/null 2>&1; then COMPOSE=docker-compose; fi; \$COMPOSE exec -T redis redis-cli ping >/dev/null"

echo "Creating production Redis snapshot..."
ssh $SSH_OPTS "$SSH_TARGET" "cd '$PROD_APP_DIR' && COMPOSE='docker compose'; if command -v docker-compose >/dev/null 2>&1; then COMPOSE=docker-compose; fi; \$COMPOSE exec -T redis redis-cli BGSAVE >/dev/null || true"
ssh $SSH_OPTS "$SSH_TARGET" "cd '$PROD_APP_DIR' && COMPOSE='docker compose'; if command -v docker-compose >/dev/null 2>&1; then COMPOSE=docker-compose; fi; while [ \"\$(\$COMPOSE exec -T redis redis-cli INFO persistence | tr -d '\r' | awk -F: '/rdb_bgsave_in_progress/{print \$2}')\" = '1' ]; do sleep 1; done"

echo "Downloading Redis volume backup to $ARCHIVE..."
rm -f "$TMP_ARCHIVE"
ssh $SSH_OPTS "$SSH_TARGET" "docker run --rm -v '$PROD_REDIS_VOLUME:/data:ro' alpine tar czf - -C /data ." > "$TMP_ARCHIVE"
mv "$TMP_ARCHIVE" "$ARCHIVE"

echo "Replacing local Redis volume: $LOCAL_REDIS_VOLUME"
compose stop redis >/dev/null 2>&1 || true
compose rm -f redis >/dev/null 2>&1 || true

docker volume create "$LOCAL_REDIS_VOLUME" >/dev/null
docker run --rm -v "$LOCAL_REDIS_VOLUME:/data" alpine sh -c 'rm -rf /data/* /data/.[!.]* /data/..?* 2>/dev/null || true'
docker run --rm -i -v "$LOCAL_REDIS_VOLUME:/data" alpine tar xzf - -C /data < "$ARCHIVE"

echo "Starting local Redis..."
compose up -d redis

echo "Synced production Redis into local copy."
echo "Backup saved at: $ARCHIVE"
