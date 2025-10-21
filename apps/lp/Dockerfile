FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY package.json turbo.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
COPY apps/base/package.json ./apps/base/
COPY apps/lp/package.json ./apps/lp/
COPY packages/cli/package.json ./packages/cli/
COPY *.config.* ./

RUN pnpm install --no-frozen-lockfile --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY apps/base ./apps/base
COPY apps/lp ./apps/lp
COPY packages/ ./packages/

ENV NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm nuxt prepare && pnpm turbo build --filter=@shelve/lp

FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 web

COPY --from=builder --chown=web:nuxt /app/apps/lp/.output ./

USER web

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/index.mjs"]
