#!/bin/sh

set -e

export GF_SECURITY_ADMIN_USER=$(cat /run/secrets/login_admin)
export GF_SECURITY_ADMIN_PASSWORD=$(cat /run/secrets/password_admin)

exec /run.sh "$@"
