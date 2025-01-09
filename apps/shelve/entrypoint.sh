#!/bin/sh

echo "Running database migrations..."
pnpm run db:push

echo "Starting the Shelve application..."
exec node .output/server/index.mjs
