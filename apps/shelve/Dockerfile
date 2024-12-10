# Stage 1: Build Stage
FROM oven/bun:latest AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN
ARG NUXT_PRIVATE_REDIS_URL

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV NODE_ENV=production
ENV NUXT_PRIVATE_REDIS_URL=${NUXT_PRIVATE_REDIS_URL:-}

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./
COPY apps/shelve/package.json ./apps/shelve/package.json
COPY apps/shelve/entrypoint.sh ./entrypoint.sh

COPY . .

RUN bun install

RUN bun run build:app

# Stage 2: Final Stage
FROM oven/bun:latest AS final

WORKDIR /app

COPY --from=build /app/apps/shelve/.output .output
COPY --from=build /app/apps/shelve/package.json ./package.json
COPY --from=build /app/entrypoint.sh ./entrypoint.sh
COPY --from=build /app/apps/shelve/server/database/schema.ts ./server/database/schema.ts
COPY --from=build /app/apps/shelve/server/database/column.helpers.ts ./server/database/column.helpers.ts
COPY --from=build /app/apps/shelve/drizzle.config.ts ./drizzle.config.ts

RUN rm -rf .output/server/node_modules
RUN rm -rf .output/server/package.json

RUN bun install --production

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
