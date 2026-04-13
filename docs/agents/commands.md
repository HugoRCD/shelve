# Commands and Workflows

## Development

- `pnpm dev` stubs the CLI then runs `turbo run dev --filter=@shelve/app` (Shelve app on port 3000).
- `pnpm dev:all` stubs the CLI then runs `turbo run dev --filter=@shelve/{app,lp}` (app + landing page).
- `pnpm dev:app` runs `turbo run dev --filter=@shelve/app`.
- `pnpm dev:lp` runs `turbo run dev --filter=@shelve/lp`.
- `pnpm dev:vault` runs `turbo run dev --filter=@shelve/vault`.
- `pnpm dev:cli` runs `turbo run dev --filter=@shelve/cli`.

## CLI

- `pnpm cli <command>` stubs then runs the CLI from source (changes reflected instantly, no rebuild).

## Build

- `pnpm build` runs `turbo run build`.
- `pnpm build:app` runs `turbo run build --filter=@shelve/app`.
- `pnpm build:lp` runs `turbo run build --filter=@shelve/lp`.
- `pnpm build:vault` runs `turbo run build --filter=@shelve/vault`.
- `pnpm build:cli` runs `turbo run build --filter=@shelve/cli`.

## Quality

- `pnpm lint` runs `turbo run lint`.
- `pnpm lint:fix` runs `turbo run lint:fix`.
- `pnpm typecheck` runs `turbo run typecheck`.
- `pnpm test` runs `turbo run test`.
- `pnpm release` runs `turbo run release` then `changeset`.
