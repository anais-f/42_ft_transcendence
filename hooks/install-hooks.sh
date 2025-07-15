#!/usr/bin/env bash
# Installation simple du hook

#!/usr/bin/env bash
# Installation simple du hook

cp "$(dirname "$0")/commit-msg" .git/hooks/
chmod +x .git/hooks/commit-msg
echo "Hook installed !"