#!/usr/bin/env bash

cp "$(dirname "$0")/commit-msg" .git/hooks/
cp "$(dirname "$0")/pre-push" .git/hooks/

chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-push

echo "Hook installed !"