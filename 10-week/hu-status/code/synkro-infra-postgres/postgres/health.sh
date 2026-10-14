#!/bin/sh
set -eu
set +x
export PGPASSWORD
PGPASSWORD=$(cat "$DB_ADMIN_PASSWORD_FILE")
# TCP authentication and completed bootstrap, rather than socket readiness alone.
psql -X -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT 1 WHERE (SELECT count(*) FROM pg_roles WHERE rolname IN ('auth_app','customers_app','products_app','workflow_app')) = 4" 2>/dev/null | grep -qx 1
