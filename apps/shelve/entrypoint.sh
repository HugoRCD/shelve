#!/bin/sh

echo "Running database migrations..."
bun run db:push

echo "Starting the Shelve application..."
exec bun run .output/server/index.mjs
