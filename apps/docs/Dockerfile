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
RUN pnpm install --frozen-lockfile

RUN pnpm run build:docs

# Stage 2: Final Stage
FROM node:22.12.0-alpine AS final

WORKDIR /app

COPY --from=build /app/apps/docs/.output .output

RUN apk update && apk add --no-cache curl

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
