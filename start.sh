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

  # If an API URL is provided at runtime, override the public app-config.js
  API_URL="${VITE_API_URL:-${VITE_API_BASE_URL:-}}"
  if [ -n "${API_URL}" ]; then
    printf 'window.__APP_CONFIG__ = { VITE_API_URL: "%s", VITE_API_BASE_URL: "%s" };\n' "$API_URL" "$API_URL" > frontend/dist/app-config.js
  fi

  PORT="${PORT:-3000}"
  exec python -m http.server "$PORT" --directory frontend/dist
fi

echo "Unknown APP_TARGET: $APP_TARGET" >&2
exit 1
