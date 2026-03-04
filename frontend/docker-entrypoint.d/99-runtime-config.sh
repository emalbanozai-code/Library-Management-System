#!/bin/sh
set -eu

cat > /usr/share/nginx/html/app-config.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:8000/api}"
};
EOF
