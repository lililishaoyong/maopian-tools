#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/maopian-tools}"
BRANCH="${BRANCH:-main}"
SITE_URL="${SITE_URL:-}"
SKIP_PULL="${SKIP_PULL:-0}"
RESTART_WORKER="${RESTART_WORKER:-0}"

cd "$APP_DIR"

compose() {
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    docker compose "$@"
  fi
}

env_value() {
  awk -F= -v key="$1" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' .env 2>/dev/null
}

if [ "$SKIP_PULL" != "1" ]; then
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

if [ ! -f .env ]; then
  echo "Missing production .env in $APP_DIR" >&2
  exit 1
fi

if [ -z "$SITE_URL" ]; then
  SITE_URL="$(env_value SITE_URL)"
fi

if [ -z "$SITE_URL" ]; then
  echo "SITE_URL is required in .env or environment." >&2
  exit 1
fi

services="web"
if [ "$RESTART_WORKER" = "1" ]; then
  services="$services worker"
fi

echo "Deploying $BRANCH to $APP_DIR"
echo "Recreating: $services"
compose up -d --build --force-recreate --no-deps $services

echo "Service status:"
compose ps

echo "Recent web logs:"
compose logs --tail=40 web

echo "Health check: $SITE_URL/api/health"
curl -fsS "$SITE_URL/api/health" >/tmp/maopian-health.json
grep -q '"ok":true' /tmp/maopian-health.json

echo "Production deploy finished."
