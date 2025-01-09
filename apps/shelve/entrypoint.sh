#!/bin/sh

echo "Running database migrations..."
bun run db:push

echo "Starting the Shelve application..."
exec pnpm run .output/server/index.mjs
