#!/bin/sh
set -eu

is_true() {
  case "${1:-}" in
    1|true|TRUE|yes|YES|on|ON) return 0 ;;
    *) return 1 ;;
  esac
}

if is_true "${RUN_MIGRATIONS:-true}"; then
  echo "Applying database migrations..."
  python manage.py migrate --noinput
fi

if is_true "${COLLECT_STATIC:-true}"; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

if is_true "${CREATE_SUPERUSER:-false}"; then
  echo "Ensuring superuser exists..."
  python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
role_name = os.getenv("DJANGO_SUPERUSER_ROLE", "admin")
first_name = os.getenv("DJANGO_SUPERUSER_FIRST_NAME", "Admin")
last_name = os.getenv("DJANGO_SUPERUSER_LAST_NAME", "User")

if not username or not email or not password:
    print(
        "Skipping superuser creation because "
        "DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, or "
        "DJANGO_SUPERUSER_PASSWORD is missing."
    )
else:
    with transaction.atomic():
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "role_name": role_name,
                "first_name": first_name,
                "last_name": last_name,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            print(f"Superuser '{username}' created.")
        else:
            changed = False
            if user.email != email:
                user.email = email
                changed = True
            if not user.is_staff:
                user.is_staff = True
                changed = True
            if not user.is_superuser:
                user.is_superuser = True
                changed = True
            if not user.is_active:
                user.is_active = True
                changed = True
            if user.role_name != role_name:
                user.role_name = role_name
                changed = True
            if user.first_name != first_name:
                user.first_name = first_name
                changed = True
            if user.last_name != last_name:
                user.last_name = last_name
                changed = True

            user.set_password(password)
            changed = True

            if changed:
                user.save()
            print(f"Superuser '{username}' updated.")
PY
fi

PORT="${PORT:-8000}"
WORKERS="${GUNICORN_WORKERS:-3}"
TIMEOUT="${GUNICORN_TIMEOUT:-120}"

echo "Starting gunicorn on 0.0.0.0:${PORT}..."
exec gunicorn foundation.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${WORKERS}" \
  --timeout "${TIMEOUT}"
