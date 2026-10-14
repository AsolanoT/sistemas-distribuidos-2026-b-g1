#!/usr/bin/env bash
# Optional CI credential, supplied only by the approved repository secret.
# Git consumes stdout privately; never invoke this helper as a diagnostic command.
set +x
set -eu
case "${1:-}" in
  "Username for 'https://github.com': "*) printf '%s\n' 'x-access-token' ;;
  "Password for 'https://x-access-token@github.com': "*)
    test -n "${SYNKRO_DEPENDENCY_READ_TOKEN:-}"
    printf '%s\n' "$SYNKRO_DEPENDENCY_READ_TOKEN"
    ;;
  *) exit 1 ;;
esac
