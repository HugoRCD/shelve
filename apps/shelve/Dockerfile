# Stage 1: Build Stage
FROM oven/bun:latest AS build

ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

COPY apps/shelve/package.json ./apps/shelve/package.json

COPY . .

RUN bun install

RUN bun run build:app

# Stage 2: Final Stage
FROM oven/bun:latest

WORKDIR /app

COPY --from=build /app/apps/shelve/.output .output

RUN apt-get update && apt-get install -y curl

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
