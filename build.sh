#!/bin/bash
set -e

echo ">>> Installing pnpm..."
npm install -g pnpm --prefix "$HOME"
export PATH="$HOME/bin:$PATH"

echo ">>> Installing dependencies..."
pnpm install --frozen-lockfile

echo ">>> Building frontend..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/toolhub run build

echo ">>> Copying frontend to api-server public..."
mkdir -p artifacts/api-server/public
cp -r artifacts/toolhub/dist/. artifacts/api-server/public/

echo ">>> Building backend..."
pnpm --filter @workspace/api-server run build

echo ">>> Build complete!"
