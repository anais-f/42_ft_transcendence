#!/usr/bin/env bash

set -eu

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

nvm install 22.20.0
nvm use 22.20.0
nvm alias default 22.20.0

npm install -g ts-node

echo "Setup node/npm done (node $(node -v))"

