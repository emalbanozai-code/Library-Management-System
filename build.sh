#!/bin/sh
set -eu

APP_TARGET="${APP_TARGET:-backend}"

if [ "$APP_TARGET" = "backend" ]; then
  cd backend
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt
  exit 0
fi

if [ "$APP_TARGET" = "frontend" ]; then
  cd frontend
  npm ci
  npm run build
  exit 0
fi

echo "Unknown APP_TARGET: $APP_TARGET" >&2
exit 1
