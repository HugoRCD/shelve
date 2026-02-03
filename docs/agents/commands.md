# Commands and Workflows

- `pnpm dev` runs `turbo run dev --filter=@shelve/{app,lp}`.
- `pnpm dev:app` runs `turbo run dev --filter=@shelve/app`.
- `pnpm dev:lp` runs `turbo run dev --filter=@shelve/lp`.
- `pnpm dev:vault` runs `turbo run dev --filter=@shelve/vault`.
- `pnpm dev:cli` runs `turbo run dev --filter=@shelve/cli`.
- `pnpm build` runs `turbo run build`.
- `pnpm build:app` runs `turbo run build --filter=@shelve/app`.
- `pnpm build:lp` runs `turbo run build --filter=@shelve/lp`.
- `pnpm build:vault` runs `turbo run build --filter=@shelve/vault`.
- `pnpm build:cli` runs `turbo run build --filter=@shelve/cli`.
- `pnpm lint` runs `turbo run lint`.
- `pnpm lint:fix` runs `turbo run lint:fix`.
- `pnpm typecheck` runs `turbo run typecheck`.
- `pnpm release` runs `turbo run release` then `changeset`.
- `pnpm cli` builds the CLI then runs `packages/cli/dist/index.mjs`.
