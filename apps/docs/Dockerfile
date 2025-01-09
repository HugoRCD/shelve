# Stage 1: Build Stage
FROM node:22.12.0-alpine AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY apps/docs/package.json ./apps/docs/package.json

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile --prod

RUN pnpm run build:docs

# Stage 2: Final Stage
FROM node:22.12.0-alpine AS final

WORKDIR /app

COPY --from=build /app/apps/docs/.output .output
COPY --from=build /app/apps/docs/package.json ./package.json

RUN pnpm install --prod

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["pnpm", "run", ".output/server/index.mjs"]
