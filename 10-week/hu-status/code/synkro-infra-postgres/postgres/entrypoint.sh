#!/bin/sh
# Adapt owner-only Compose bind secrets before the official image drops privileges.
set -eu
set +x
umask 077
directory=/run/synkro-postgres-secrets
test "$(id -u)" = 0 || { echo 'postgres: secret staging requires container root' >&2; exit 2; }
mkdir -p "$directory"
chown postgres:postgres "$directory"
chmod 700 "$directory"
for variable in POSTGRES_PASSWORD_FILE DB_ADMIN_PASSWORD_FILE AUTH_APP_PASSWORD_FILE CUSTOMERS_APP_PASSWORD_FILE PRODUCTS_APP_PASSWORD_FILE WORKFLOW_APP_PASSWORD_FILE; do
  source=$(printenv "$variable")
  if ! test -n "$source" || ! test -r "$source" || ! test -s "$source"; then
    echo 'postgres: protected secret input unavailable' >&2
    exit 2
  fi
  target="$directory/$variable"
  cat -- "$source" > "$target"
  chown postgres:postgres "$target"
  chmod 400 "$target"
  export "$variable=$target"
done
exec /usr/local/bin/docker-entrypoint.sh "$@"
