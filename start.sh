#!/bin/sh
set -eu

APP_TARGET="${APP_TARGET:-backend}"

if [ "$APP_TARGET" = "backend" ]; then
  cd backend
  exec ./entrypoint.sh
fi

if [ "$APP_TARGET" = "frontend" ]; then
  if [ ! -d frontend/dist ]; then
    echo "frontend/dist not found. Run build.sh first." >&2
    exit 1
  fi
  PORT="${PORT:-3000}"
  exec python -m http.server "$PORT" --directory frontend/dist
fi

echo "Unknown APP_TARGET: $APP_TARGET" >&2
exit 1
