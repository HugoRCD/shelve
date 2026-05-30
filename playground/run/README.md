# `playground/run`

Self-contained, zero-network fixture for testing `shelve run` end-to-end.

Boots a **fake Shelve API** on `127.0.0.1:7777` (vanilla `node:http`, no deps), seeded with a team / project / environments / variables / token, then runs the locally-stubbed CLI against it. No app, no database, no auth flow — just the CLI's actual request/response loop.

## What's here

```text
playground/run/
├── package.json              # 4 scripts (dev / start / echo / fail)
├── shelve.json               # url + slug + project + defaultEnv (matches seed)
├── seed.json                 # team, project, environments, variables, token
├── server.mjs                # fake Shelve API (port 7777)
├── start.mjs                 # orchestrator: server → wait health → CLI → kill server
├── scripts/print-env.mjs     # what `dev` / `start` actually run
└── README.md
```

Not part of the pnpm workspace, no deps, nothing to install.

## Run

From the repo root:

```sh
pnpm play              # = shelve run dev  (keep-alive, masks values, handles signals)
pnpm play:start        # = shelve run start  (one-shot)
pnpm play:fail         # = shelve run fail   (verifies exit-code propagation)
pnpm play:watch        # = shelve run dev --watch  (poll-based reload via SIGHUP)

pnpm play -- --debug   # forward flags to the CLI
pnpm play -- --json config   # machine-readable config (token redacted)
pnpm play -- --non-interactive --yes pull --env development   # agent-style pull smoke
pnpm play:server       # only the fake API (handy when iterating on the server itself)
```

Each `play*` script does three things:

1. `pnpm -C packages/cli stub` — rebuilds the CLI in stub mode. `dist/index.mjs` becomes a thin re-export of `src/`, so edits in `packages/cli/src/**` are picked up **without a rebuild**.
2. Boots `server.mjs` and probes `/health` for up to 5s.
3. Spawns the local CLI with `SHELVE_URL`, `SHELVE_TOKEN`, `SHELVE_TEAM_SLUG`, `SHELVE_PROJECT`, `SHELVE_DEFAULT_ENV` injected from `seed.json`. Server is killed when the CLI exits or you Ctrl-C.

## What the fake API serves

All endpoints require `Authorization: Bearer <seed token>` (must match `seed.json`; the orchestrator injects it via `SHELVE_TOKEN`):

| Method | Path                                                            | Returns                          |
|--------|-----------------------------------------------------------------|----------------------------------|
| GET    | `/health`                                                       | `{ ok: true, ts }`               |
| GET    | `/api/user/me`                                                  | seeded user                      |
| GET    | `/api/teams/:slug/projects/name/:name`                          | seeded project                   |
| GET    | `/api/teams/:slug/environments`                                 | seeded environments              |
| GET    | `/api/teams/:slug/environments/:envName`                        | the matching environment         |
| GET    | `/api/teams/:slug/projects/:projectId/variables/env/:envId`     | seeded variables for that env    |
| POST   | `/api/teams/:slug/projects`                                     | echoes the seeded project        |

Plus two debug helpers, no auth:

| Method | Path                              | Effect                                                                 |
|--------|-----------------------------------|------------------------------------------------------------------------|
| POST   | `/__playground/variables`         | Swap the in-memory variables for one env. Body: `{ env, variables }`.  |
| POST   | `/__playground/reset`             | Restore the seeded variables.                                          |

Useful for exercising `--watch`:

```sh
# in another terminal, while `pnpm play:watch` is running:
curl -s -X POST http://127.0.0.1:7777/__playground/variables \
  -H 'content-type: application/json' \
  -d '{"env":"development","variables":[{"key":"HELLO","value":"changed"}]}'
# Within ~5s the CLI logs "Variables changed — reloading child process.",
# kills the running child, respawns it with the new env, and print-env.mjs
# prints a fresh banner with the updated HELLO value.
```

`pnpm play:watch` runs `shelve run dev --watch --restart-on-change` (full respawn so new env vars are actually visible to the child). Plain `--watch` alone only sends SIGHUP and the existing process keeps its old `process.env` — useful for daemons that re-read env on SIGHUP, but not what you want for fast iteration.

## Customizing

- Add / change variables in `seed.json` → re-run.
- Change the port: `PLAYGROUND_PORT=8888 pnpm play`.
- Verbose API logs: `PLAYGROUND_VERBOSE=1 pnpm play:server`.
- Show extra env vars in `print-env.mjs`: `PLAYGROUND_SHOW_ENV_PATTERN='^MY_|HELLO|API_' pnpm play`.
- Test against the **real** Shelve cloud: just run the CLI normally (`pnpm cli run dev …`) — the playground is opt-in.

## Ctrl-C / arrêt propre

`shelve run` exécute les scripts `package.json` **directement** (`sh -c "…"` / `cmd /c "…"`), sans passer par `pnpm run` / `npm run`. Du coup un Ctrl-C ne déclenche plus `[ELIFECYCLE] Command failed with exit code 130` — l'interruption est traitée comme un arrêt normal (exit 0 côté CLI et orchestrateur).

Les codes 130 (SIGINT), 143 (SIGTERM) et 129 (SIGHUP) ne sont pas des erreurs applicatives.

## Why this exists

Earlier I had no fast loop on `shelve run` and one silent failure took an hour to reproduce. Now I can edit `packages/cli/src/commands/run.ts` and have the full real-world request flow exercised in 2 seconds with no network, no auth dance, no `app.shelve.cloud` round-trip.
