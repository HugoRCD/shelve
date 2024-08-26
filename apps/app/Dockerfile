FROM oven/bun:latest as builder

# Définir le répertoire de travail à la racine du monorepo
WORKDIR /monorepo

# Copier les fichiers nécessaires du monorepo
COPY package.json .
COPY bun.lockb .
COPY apps/app ./apps/app
COPY packages ./packages

# Installer les dépendances
RUN bun install

# Construire l'application
WORKDIR /monorepo/apps/app
RUN bun run build

FROM oven/bun:latest as production
WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /monorepo/apps/app /app
COPY --from=builder /monorepo/node_modules /app/node_modules

EXPOSE 3000

CMD ["bun", "run", "start"]
