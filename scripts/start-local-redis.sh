#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop, OrbStack, or Colima first." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop, OrbStack, or Colima and retry." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  docker compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.local.yml" up -d redis
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.local.yml" up -d redis
else
  echo "Docker Compose is required. Install Docker Desktop or docker-compose first." >&2
  exit 1
fi
