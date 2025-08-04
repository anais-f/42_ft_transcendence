#!/usr/bin/env bash

set -e

GIT_ROOT=$(git rev-parse --show-toplevel)

cp "$GIT_ROOT/hooks/commit-msg" "$GIT_ROOT/.git/hooks/"
cp "$GIT_ROOT/hooks/pre-push" "$GIT_ROOT/.git/hooks/"

chmod +x "$GIT_ROOT/.git/hooks/commit-msg"
chmod +x "$GIT_ROOT/.git/hooks/pre-push"

echo "Hook installed!"
