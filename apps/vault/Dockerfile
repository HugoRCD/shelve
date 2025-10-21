FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY package.json turbo.json .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/base/package.json ./apps/base/
COPY apps/vault/package.json ./apps/vault/
COPY packages/cli/package.json ./packages/cli/
COPY *.config.* ./

RUN pnpm install --no-frozen-lockfile --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY apps/base ./apps/base
COPY apps/vault ./apps/vault
COPY packages ./packages

ENV NODE_OPTIONS=--max-old-space-size=4096

RUN pnpm nuxt prepare && pnpm turbo build --filter=@shelve/vault

FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nuxt \
  && adduser --system --uid 1001 vault

COPY --from=builder --chown=vault:nuxt /app/apps/vault/.output ./

USER vault
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/index.mjs"]
