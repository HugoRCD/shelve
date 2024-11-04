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

COPY apps/lp/package.json ./apps/lp/package.json

COPY . .

RUN bun install

RUN bun run build:lp

# Stage 2: Final Stage
FROM oven/bun:latest

WORKDIR /app

COPY --from=build /app/apps/lp/.output .output

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
