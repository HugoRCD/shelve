FROM oven/bun:latest AS builder

# Définir le répertoire de travail à la racine du monorepo
WORKDIR /shelve

# Copier les fichiers nécessaires du monorepo
COPY package.json .
COPY bun.lockb .
COPY apps/app ./apps/app
COPY packages ./packages

# Installer les dépendances
RUN bun install

# Construire l'application
WORKDIR /shelve/apps/app
RUN bun run build

FROM oven/bun:latest AS production
WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /shelve/apps/app/.output ./.output
COPY --from=builder /shelve/apps/app/package.json .
COPY --from=builder /shelve/apps/app/node_modules ./node_modules

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "start"]
