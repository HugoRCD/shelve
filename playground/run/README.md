# `playground/run`

Local fixture for testing `shelve run` end-to-end without leaving the repo.

It is **not** part of the pnpm workspace — `pnpm install` ignores it. That's
intentional: we don't want lockfile checks or `node_modules` prompts from the
host project polluting `shelve run` while we're trying to debug it.

## What's here

- `package.json` — tiny project with four scripts:
  - `dev` — prints the injected secrets, then stays alive (handles SIGHUP / SIGINT / SIGTERM, useful for testing `--watch`).
  - `start` — prints the injected secrets and exits.
  - `echo` — alias for `start`.
  - `fail` — exits with code 7. Useful for testing exit-code propagation.
- `scripts/print-env.mjs` — the actual node script the above call into.
- `shelve.json` — points the CLI at a Shelve project. **Edit `slug` and `project`** to match a project you own.

## One-time setup

1. Edit `playground/run/shelve.json`:
   - `project` → name of a project you own on Shelve.
   - `slug` → your team slug.
   - `defaultEnv` → an environment you have variables in.
2. Authenticate the local CLI once:
   ```sh
   pnpm cli login
   ```

## Run

From the repo root:

```sh
pnpm play                # equivalent to `shelve run dev` inside playground/run
pnpm play:start          # one-shot: prints env and exits
pnpm play:fail           # propagate non-zero exit codes
pnpm play -- --debug     # forward flags to the CLI
```

Under the hood:

1. `pnpm -C packages/cli stub` rebuilds a tiny `dist/index.mjs` that re-exports
   from `src/` — so edits to `packages/cli/src/**` are picked up **without a
   rebuild**.
2. `cd playground/run && node ../../packages/cli/dist/index.mjs run dev`.

## Iterating on `packages/cli/src/commands/run.ts`

- Edit the source.
- Re-run `pnpm play`. No rebuild step.
- The `--debug` flag prints the resolved command, spawn args, cache key, etc.

## Notes

- `pnpm play` always runs `shelve run dev`. The `dev` script here just calls
  `node scripts/print-env.mjs --keep-alive`, so no `pnpm install` is ever
  triggered. If your host project (e.g. a Nuxt app) prompts to reinstall
  `node_modules` when you run `shelve run dev` there, that's a `pnpm` /
  `nypm` behavior in your own project — not something `shelve run` itself
  triggers in this fixture.
