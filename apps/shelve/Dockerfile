FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY package.json turbo.json .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/base/package.json ./apps/base/
COPY apps/shelve/package.json ./apps/shelve/
COPY packages/cli/package.json ./packages/cli/
COPY packages/utils/package.json ./packages/utils/
COPY *.config.* ./

RUN pnpm install --no-frozen-lockfile --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY apps/base ./apps/base
COPY apps/shelve ./apps/shelve
COPY packages ./packages

ENV NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm nuxt prepare && pnpm turbo build --filter=@shelve/app

FROM node:24-alpine AS runner
WORKDIR /app

RUN corepack enable

COPY --from=builder --chown=shelve:nuxt /app/apps/shelve/.output ./.output
COPY --from=builder /app/apps/shelve/server/database/ ./apps/shelve/server/database
COPY --from=builder /app/apps/shelve/drizzle.config.ts ./apps/shelve/drizzle.config.ts
COPY --from=builder /app/apps/shelve/entrypoint.sh ./apps/shelve/entrypoint.sh

RUN chmod +x ./apps/shelve/entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app/apps/shelve
CMD ["./entrypoint.sh"]
