FROM oven/bun:latest as builder

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:latest as production

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["bun", "run", "start"]
