#!/bin/bash
set -e

echo ">>> Node version: $(node --version)"
echo ">>> npm version: $(npm --version)"

echo ">>> Installing pnpm via npm prefix (writable)..."
export NPM_CONFIG_PREFIX="$HOME/.npm-global"
mkdir -p "$HOME/.npm-global"
npm install -g pnpm
export PATH="$HOME/.npm-global/bin:$PATH"

echo ">>> pnpm version: $(pnpm --version)"

echo ">>> Installing dependencies..."
pnpm install --frozen-lockfile

echo ">>> Building frontend (toolhub)..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/toolhub run build

echo ">>> Copying frontend build to api-server public dir..."
mkdir -p artifacts/api-server/public
cp -r artifacts/toolhub/dist/. artifacts/api-server/public/

echo ">>> Building backend (api-server)..."
pnpm --filter @workspace/api-server run build

echo ">>> Build complete!"
