# Shelve — agent & CI workflows

## Default agent workflow

```bash
export SHELVE_TOKEN="…"
export SHELVE_TEAM_SLUG="my-team"
export SHELVE_PROJECT="my-app"

shelve init
shelve run -- pnpm test
shelve run -- pnpm dev
```

Do **not** run `shelve pull` unless the user explicitly needs an on-disk `.env` file.

## GitHub Actions

```yaml
env:
  SHELVE_TOKEN: ${{ secrets.SHELVE_TOKEN }}
  SHELVE_TEAM_SLUG: my-team
  SHELVE_PROJECT: my-app
  SHELVE_DEFAULT_ENV: ci

steps:
  - run: pnpm install
  - run: npx @shelve/cli run -- pnpm test
```

Use `--non-interactive` in CI (also enabled automatically when `CI=true`).

## Parsing CLI output in scripts

```bash
CONFIG=$(shelve --json config)
PROJECT=$(echo "$CONFIG" | jq -r '.data.project')
```

Errors go to stderr as JSON when `--json` is set. Check exit code `$?`.

## Monorepo

- Each package can have its own `shelve.json` with a different `project`.
- Root `shelve.json` is **merged** (shared `slug`, etc.).
- Commands run in the **current working directory** only — they do not iterate all packages automatically.

## Offline / air-gapped

After one successful online fetch:

```bash
shelve run --offline -- pnpm build
```

Cache lives at `~/.shelve/cache/` (encrypted with key derived from token). Revoking the token invalidates cache.

## Secret references (committed templates)

Commit `.env.template`:

```bash
DATABASE_URL=shelve://DATABASE_URL
API_KEY=shelve://production/API_KEY
```

Run with:

```bash
shelve run --template .env.template -- pnpm dev
```

## Watch mode (long-running dev)

```bash
# SIGHUP reload (daemons that re-read env on SIGHUP)
shelve run --watch -- pnpm dev

# Full respawn (Node scripts that read process.env once)
shelve run --watch --restart-on-change -- pnpm dev
```

## When user asks to "add env vars locally"

1. Ask if they need a disk `.env` or runtime injection.
2. If runtime → `shelve run -- <cmd>`.
3. If disk → warn about agent risk, ensure `shelve init`, then `shelve pull --yes --env …` only if they confirm.

## Install / update this skill

```bash
npx skills add https://shelve.cloud
```

Catalog: `https://shelve.cloud/.well-known/skills/index.json` (single skill: `shelve`)
