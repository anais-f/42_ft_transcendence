#!/usr/bin/env bash

cp "$(dirname "$0")/commit-msg" .git/hooks/
chmod +x .git/hooks/commit-msg
echo "Hook installed !"