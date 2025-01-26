# Stage 1: Build Stage
FROM node:22.13.1-alpine AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY vault/package.json ./vault/package.json

COPY . .

RUN corepack enable
RUN pnpm install --frozen-lockfile

RUN pnpm run build:vault

# Stage 2: Final Stage
FROM node:22.13.1-alpine AS final

WORKDIR /app

COPY --from=build /app/vault/.output .output

RUN apk update && apk add --no-cache curl

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
