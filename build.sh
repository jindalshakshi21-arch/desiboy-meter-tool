#!/bin/bash
set -e

echo ">>> Node: $(node --version)"

echo ">>> Installing pnpm@9..."
export NPM_CONFIG_PREFIX="$HOME/.npm-global"
mkdir -p "$HOME/.npm-global/bin"
npm install -g pnpm@9
export PATH="$HOME/.npm-global/bin:$PATH"
echo ">>> pnpm: $(pnpm --version)"

echo ">>> Installing ALL dependencies (including devDependencies)..."
NODE_ENV=development pnpm install --no-frozen-lockfile

echo ">>> Building frontend..."
PORT=3000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/toolhub run build

echo ">>> Copying frontend to api-server public..."
mkdir -p artifacts/api-server/public
cp -r artifacts/toolhub/dist/. artifacts/api-server/public/

echo ">>> Building backend..."
NODE_ENV=production pnpm --filter @workspace/api-server run build

echo ">>> Running database migrations..."
if [ -n "$DATABASE_URL" ]; then
  NODE_ENV=production pnpm --filter @workspace/db run push-force
  echo ">>> Database schema applied!"
else
  echo ">>> WARNING: DATABASE_URL not set, skipping migrations"
fi

echo ">>> Build complete!"
