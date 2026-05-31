# Shelve CLI — command reference

## All commands

| Command | Purpose |
|---------|---------|
| `run` | Inject secrets into a child process (no `.env` on disk) |
| `doctor` | Validate config, auth, API, cache, agent context |
| `init` | Agent ignore files + `.gitignore` shelve block |
| `login` | Browser device login by default; stores token in keychain or XDG |
| `logout` | Clear stored credentials |
| `me` | Show logged-in user |
| `push` | Upload local `.env` variables to Shelve |
| `pull` | Download variables to local `.env` file |
| `diff` | Compare local `.env` with Shelve (no writes) |
| `sync` | Apply `sourceOfTruth` policy (push or pull) |
| `create` | Create Shelve project + `shelve.json` |
| `config` | Print merged configuration |
| `generate` | Generate `.env.example` or ESLint config |
| `upgrade` | Update `@shelve/cli` to latest npm version |

## Global flags

Apply to every command: `--json`, `--quiet` / `-q`, `--yes` / `-y`, `--non-interactive`, `--debug`.

## JSON success shape

```json
{ "ok": true, "command": "config", "data": { } }
```

## JSON error shape (stderr)

```json
{
  "ok": false,
  "error": {
    "code": "MISSING_ENV",
    "message": "Environment name is required.",
    "hint": "Pass --env or set defaultEnv in shelve.json / SHELVE_DEFAULT_ENV."
  }
}
```

## Per-command JSON `data`

### `config`

Merged config object. `token` is always `"***"` when present.

### `me`

```json
{ "loggedIn": true, "username": "…", "email": "…" }
```

or `{ "loggedIn": false }`.

### `push`

```json
{ "env": "development", "variableCount": 12, "pushed": true }
```

### `pull`

```json
{
  "env": "development",
  "variableCount": 12,
  "file": ".env",
  "keys": ["DATABASE_URL", "API_KEY"]
}
```

Values are **never** included.

### `init`

```json
{
  "writtenFiles": [".cursorignore", ".aiderignore"],
  "skippedFiles": [],
  "gitignoreUpdated": true
}
```

### `login`

```json
{ "username": "…", "email": "…" }
```

### `create`

```json
{ "name": "my-app", "slug": "my-team", "configPath": "shelve.json" }
```

### `generate`

```json
{ "type": "env-example", "path": ".env.example" }
```

Types: `env-example`, `eslint` (via `--type`).

### `upgrade`

```json
{ "previous": "5.0.3", "current": "latest", "updated": true }
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 128+n | Child signal exit (`run`) |
| 129 | Parent gone / EIO |
| 130 / 143 | SIGINT / SIGTERM |

### `diff`

```json
{
  "env": "development",
  "file": ".env",
  "policy": { "sourceOfTruth": "remote", "onPushConflict": "overwrite", "pullMode": "replace", "allowPush": true, "allowPull": true, "requireConfirmation": false },
  "onlyLocal": ["LOCAL_KEY"],
  "onlyRemote": [],
  "changed": ["API_URL"],
  "unchanged": ["NODE_ENV"]
}
```

### `sync`

```json
{ "env": "development", "action": "pull", "variableCount": 12, "file": ".env" }
```

## Error codes (automation)

| Code | Meaning |
|------|---------|
| `PUSH_BLOCKED` | Push disabled by sync policy |
| `PULL_BLOCKED` | Pull disabled by sync policy |
| `SYNC_CONFLICT` | Diverging keys with `onPushConflict: fail` |
| `ENV_PROTECTED` | Server blocked write to protected environment |

## Environment variables

| Variable | Overrides |
|----------|-----------|
| `SHELVE_TOKEN` | Auth token |
| `SHELVE_TEAM_SLUG` | `slug` in config |
| `SHELVE_PROJECT` | `project` in config |
| `SHELVE_URL` | Shelve instance URL |
| `SHELVE_DEFAULT_ENV` | Default `--env` |
| `SHELVE_DEBUG=1` | Debug logging |
| `AI_AGENT` | Force agent-shell detection |

## Config options (`shelve.json`)

| Key | Default | Description |
|-----|---------|-------------|
| `project` | package.json name | Project name |
| `slug` | — | Team slug |
| `defaultEnv` | — | Default environment |
| `confirmChanges` | `false` | Confirm before push/pull file writes |
| `envFileName` | `.env` | Local env file name |
| `autoUppercase` | `true` | Uppercase keys on push |
| `autoCreateProject` | `true` | Create project if missing |
| `sync` | — | Per-env sync policy (see `sync-policies.md` in skill folder) |

Schema: https://shelve.cloud/schema.json
