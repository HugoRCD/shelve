#!/bin/sh
set -e

echo "Installing Drizzle dependencies..."
pnpm add drizzle-kit drizzle-orm postgres --save-dev

echo "Running Drizzle migrations..."
pnpm drizzle-kit migrate

echo "Removing Drizzle dependencies..."
pnpm remove drizzle-kit drizzle-orm postgres

echo "Starting Node server..."
exec node .output/server/index.mjs
