# Stage 1: Build Stage
FROM oven/bun:latest AS build

ENV DATABASE_URL=$DATABASE_URL
ENV TURBO_TEAM=$TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app

# Copy necessary files
# Copy root package.json and lockfile
COPY package.json ./
COPY bun.lockb ./

# Copy the api package.json
COPY apps/shelve/package.json ./apps/shelve/package.json

# Copy the rest of the application
COPY . .

# Install dependencies
RUN bun install

RUN bun run prisma:generate

# Build the application
RUN bun run build

# Stage 2: Final Stage
FROM oven/bun:latest

WORKDIR /app

# Copy build output from the build stage
COPY --from=build /app/apps/shelve/.output .output

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
