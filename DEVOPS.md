# DevOps and Deployment Guide

## Architecture
- `backend/` is a Django API service.
- `frontend/` is a Vite React SPA served by Nginx.
- Both are containerized separately.
- Local stack can run with `docker-compose.yml`.
- Railway should run as 2 services (`backend` and `frontend`) plus a Postgres plugin.

## Local Docker Usage
1. Build and run:
```bash
docker compose up --build
```
2. Frontend: `http://localhost:3000`
3. Backend API: `http://localhost:8000/api`
4. Admin: `http://localhost:8000/admin`

## Backend Runtime Behavior
`backend/entrypoint.sh` supports:
- `RUN_MIGRATIONS=true` to run `python manage.py migrate`.
- `COLLECT_STATIC=true` to run `python manage.py collectstatic`.
- `CREATE_SUPERUSER=true` to create/update admin user from env vars:
  - `DJANGO_SUPERUSER_USERNAME`
  - `DJANGO_SUPERUSER_EMAIL`
  - `DJANGO_SUPERUSER_PASSWORD`
  - Optional: `DJANGO_SUPERUSER_ROLE`, `DJANGO_SUPERUSER_FIRST_NAME`, `DJANGO_SUPERUSER_LAST_NAME`

## Railway Deployment
Create 2 Railway services from this same repo.

### 1) Backend service
- Root directory: `backend`
- Uses: `backend/Dockerfile`
- Optional Railway config: `backend/railway.toml`
- Attach a Railway Postgres plugin to this service.

Set backend variables:
- `DJANGO_SECRET_KEY` (required, strong value)
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS=.up.railway.app,<your-backend-domain>`
- `BACKEND_URL=https://<your-backend-domain>`
- `FRONTEND_URL=https://<your-frontend-domain>`
- `DJANGO_CORS_ALLOW_ALL_ORIGINS=false`
- `DJANGO_CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-frontend-domain>,https://<your-backend-domain>`
- `SESSION_COOKIE_SECURE=true`
- `CSRF_COOKIE_SECURE=true`
- `REFRESH_COOKIE_SECURE=true`
- `REFRESH_COOKIE_SAMESITE=None` (for cross-site cookie auth)
- `RUN_MIGRATIONS=true`
- `COLLECT_STATIC=true`
- `CREATE_SUPERUSER=true` (first deploy only, then optional to disable)
- `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD`
- `DATABASE_URL` is usually injected automatically by Railway Postgres plugin.

### 2) Frontend service
- Root directory: `frontend`
- Uses: `frontend/Dockerfile`
- Optional Railway config: `frontend/railway.toml`

Set frontend variables:
- `VITE_API_BASE_URL=https://<your-backend-domain>/api`

## Environment Files
- Backend template: `backend/.env.example`
- Frontend template: `frontend/.env.example`
