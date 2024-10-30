# Stage 1: Build Stage
FROM oven/bun:latest AS build

WORKDIR /app

# Copy necessary files
COPY . .

# Install dependencies
RUN bun install

# Build the application
RUN bun run build

# Stage 2: Final Stage
FROM oven/bun:latest

WORKDIR /app

# Copy build output from the build stage
COPY --from=build /app/.output /app/.output

# Set the entrypoint
ENTRYPOINT ["bun", "run", "start"]
