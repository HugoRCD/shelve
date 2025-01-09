# Stage 1: Build Stage
FROM node:22.12.0-alpine AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY apps/shelve/package.json ./apps/shelve/package.json
COPY apps/shelve/entrypoint.sh ./entrypoint.sh

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile --prod

RUN pnpm run build:app

# Stage 2: Final Stage
FROM node:22.12.0-alpine AS final

WORKDIR /app

COPY --from=build /app/apps/shelve/.output .output
COPY --from=build /app/apps/shelve/package.json ./package.json
COPY --from=build /app/entrypoint.sh ./entrypoint.sh
COPY --from=build /app/apps/shelve/server/database/schema.ts ./server/database/schema.ts
COPY --from=build /app/apps/shelve/server/database/column.helpers.ts ./server/database/column.helpers.ts
COPY --from=build /app/apps/shelve/drizzle.config.ts ./drizzle.config.ts

RUN pnpm install --prod

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
