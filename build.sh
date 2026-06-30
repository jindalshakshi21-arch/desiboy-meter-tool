#!/bin/bash
set -e

echo ">>> Node: $(node --version)"

echo ">>> Installing pnpm@9..."
export NPM_CONFIG_PREFIX="$HOME/.npm-global"
mkdir -p "$HOME/.npm-global/bin"
npm install -g pnpm@9
export PATH="$HOME/.npm-global/bin:$PATH"
echo ">>> pnpm: $(pnpm --version)"

echo ">>> Installing dependencies (no-frozen-lockfile to handle config mismatch)..."
pnpm install --no-frozen-lockfile

echo ">>> Building frontend..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/toolhub run build

echo ">>> Copying frontend to api-server public..."
mkdir -p artifacts/api-server/public
cp -r artifacts/toolhub/dist/. artifacts/api-server/public/

echo ">>> Building backend..."
pnpm --filter @workspace/api-server run build

echo ">>> Build complete!"
