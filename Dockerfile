# Stage 1: Build Stage
FROM node:22.13.1-alpine AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./package.json
COPY entrypoint.sh ./entrypoint.sh

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile

RUN pnpm run build:app

# Stage 2: Final Stage
FROM node:22.13.1-alpine AS final

WORKDIR /app

COPY --from=build /app/.output .output
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/entrypoint.sh ./entrypoint.sh
COPY --from=build /app/server/database/schema.ts ./server/database/schema.ts
COPY --from=build /app/server/database/column.helpers.ts ./server/database/column.helpers.ts
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

COPY --from=build /app/packages/types ./packages/types
COPY --from=build /app/tsconfig.json ./tsconfig.json

RUN corepack enable
RUN pnpm install --prod

RUN apk update && apk add --no-cache curl

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
