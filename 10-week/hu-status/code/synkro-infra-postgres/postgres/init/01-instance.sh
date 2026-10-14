#!/usr/bin/env bash
# Runs on an empty volume, or deliberately via scripts/bootstrap.sh <environment>.
set -euo pipefail
set +x
for domain in AUTH CUSTOMERS PRODUCTS WORKFLOW; do
  variable="${domain}_APP_PASSWORD_FILE"
  path="${!variable:-}"
  [[ -n "$path" && -r "$path" && -s "$path" ]] || { echo "bootstrap: missing readable $variable" >&2; exit 2; }
  value=$(cat -- "$path")
  # Match Auth's UTF-8 secret-file contract: remove trailing CR/LF only.
  while [[ "$value" == *$'\r' || "$value" == *$'\n' ]]; do value=${value%?}; done
  [[ -n "$value" ]] || { echo "bootstrap: empty $variable" >&2; exit 2; }
  export "${domain}_APP_PASSWORD=$value"
done
[[ -r "${DB_ADMIN_PASSWORD_FILE:-}" ]] || { echo 'bootstrap: missing administrator secret file' >&2; exit 2; }
export PGPASSWORD
PGPASSWORD=$(cat -- "$DB_ADMIN_PASSWORD_FILE")
# psql reads secrets from its environment, never process arguments or shell-expanded SQL.
# A single transaction and advisory lock prevent partial or overlapping bootstrap.
if ! psql -X -q -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" >/dev/null 2>/dev/null <<'SQL'
\set VERBOSITY terse
\getenv auth_password AUTH_APP_PASSWORD
\getenv customers_password CUSTOMERS_APP_PASSWORD
\getenv products_password PRODUCTS_APP_PASSWORD
\getenv workflow_password WORKFLOW_APP_PASSWORD
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';
SET LOCAL log_statement = 'none';
SET LOCAL log_min_error_statement = 'panic';
SELECT pg_advisory_xact_lock(20402);
SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD %L; ALTER ROLE %I SET search_path TO %I', name, password, name, schema_name)
FROM (VALUES ('auth_app', :'auth_password', 'auth_schema'), ('customers_app', :'customers_password', 'customers_schema'),
             ('products_app', :'products_password', 'products_schema'), ('workflow_app', :'workflow_password', 'workflow_schema')) AS users(name, password, schema_name)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = name)
\gexec
COMMIT;
SQL
then
  echo 'bootstrap: SQL failed; transaction rolled back (secret-bearing diagnostics suppressed)' >&2
  exit 1
fi
unset PGPASSWORD AUTH_APP_PASSWORD CUSTOMERS_APP_PASSWORD PRODUCTS_APP_PASSWORD WORKFLOW_APP_PASSWORD
echo 'bootstrap: missing instance users created; existing users preserved'
