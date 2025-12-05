#!/bin/bash

ENV_EXAMPLE=".env.example"
ENV_FILE=".env"

if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "File $ENV_EXAMPLE not found"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "File $ENV_FILE is missing"
  echo "Copy $ENV_EXAMPLE to $ENV_FILE and configure the values"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

REQUIRED_VARS=$(grep -v '^#' "$ENV_EXAMPLE" | grep -v '^$' | cut -d '=' -f 1)

missing_vars=()

echo "Checking environment variables..."

for var in $REQUIRED_VARS; do
  if [ -z "${!var}" ]; then
    echo "[FAILED] $var is missing or empty"
    missing_vars+=("$var")
  else
    echo "[OK] $var"
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo ""
  echo "${#missing_vars[@]} variable(s) missing or empty"
  echo "Refer to $ENV_EXAMPLE for expected values"
  exit 1
fi

echo ""
echo "All variables are configured!"
