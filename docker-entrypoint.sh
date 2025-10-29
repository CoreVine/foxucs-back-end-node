#!/usr/bin/env bash
set -euo pipefail

echo "Starting docker entrypoint..."

# helper: wait for TCP port
wait_for_tcp() {
  host="$1"
  port="$2"
  retries=60
  until nc -z "$host" "$port"; do
    retries=$((retries-1))
    if [ "$retries" -le 0 ]; then
      echo "Timeout waiting for $host:$port"
      return 1
    fi
    echo "Waiting for $host:$port..."
    sleep 2
  done
}

# If DB_HOST is set, wait for DB to accept connections on DB_PORT
if [ -n "${DB_HOST:-}" ]; then
  DBP=${DB_PORT:-3306}
  echo "Waiting for DB ${DB_HOST}:${DBP} to be available..."
  wait_for_tcp "${DB_HOST}" "${DBP}"
fi

if [ "${SKIP_MIGRATIONS:-false}" != "true" ]; then
  echo "Running migrations..."
  pnpm exec sequelize-cli db:migrate || {
    echo "Migrations failed" >&2
    exit 1
  }
else
  echo "SKIP_MIGRATIONS=true; skipping migrations"
fi

echo "Launching app: $@"
exec "$@"
