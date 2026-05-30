---
name: shelve
description: Manage secrets with Shelve and @shelve/cli — inject env vars with shelve run, sync with push/pull, secure AI workspaces with init, and use --json/--non-interactive for automation.
---

# Shelve CLI & secrets

Shelve is a team secrets platform. The **`@shelve/cli`** package (`shelve` binary) syncs environment variables between your machine and Shelve.

Official docs: https://shelve.cloud/docs/cli  
Install skill updates: `npx skills add https://shelve.cloud`

## Security rules (read first)

1. **Prefer `shelve run -- <cmd>`** — secrets stay in the child process environment; nothing is written to `.env` on disk.
2. **Avoid `shelve pull` in agent shells** — it writes plaintext secrets to disk. Agents can exfiltrate them. If you must pull, pass `--yes` explicitly and ensure `.cursorignore` / agent ignores exist (`shelve init`).
3. **Never commit** `SHELVE_TOKEN`, `.env`, or cache files under `~/.shelve/`.
4. **Never print secret values** in logs, JSON, or commit messages. CLI `--json` output excludes values by design.
5. Run **`shelve init`** once per workspace before any secret operations.

## Non-interactive setup

Set these environment variables so the CLI never prompts:

| Variable | Purpose |
|----------|---------|
| `SHELVE_TOKEN` | API token from app.shelve.cloud/user/tokens |
| `SHELVE_TEAM_SLUG` | Team slug |
| `SHELVE_PROJECT` | Project name |
| `SHELVE_DEFAULT_ENV` | Default environment (optional) |
| `SHELVE_URL` | Instance URL (default `https://app.shelve.cloud`) |

Global flags (usable before or after the subcommand):

| Flag | Effect |
|------|--------|
| `--json` | Machine-readable stdout; errors as JSON on stderr |
| `--quiet` / `-q` | No spinners or clack UI |
| `--yes` / `-y` | Skip confirmations |
| `--non-interactive` | Fail instead of prompt |
| `--debug` | Verbose logs (`SHELVE_DEBUG=1` also works) |

Auto non-interactive when: `CI=true`, AI agent shell detected, or `AI_AGENT` is set.

## Command cheat sheet

```bash
# Inject secrets and run (preferred)
shelve run -- pnpm dev
shelve run --env preview -- pnpm build
shelve run dev                    # resolves package.json script directly

# One-time workspace hardening
shelve init

# Auth
shelve login --token "$SHELVE_TOKEN"
shelve me --json
shelve logout

# Sync (human workflows; use --env)
shelve push --env development --yes
shelve pull --env development --yes   # dangerous in agent shells without --yes

# Inspect config
shelve --json config                # token shown as ***

# Scaffold
shelve create --name my-app --slug my-team
shelve generate --type env-example
shelve generate --type eslint
```

## `shelve run` flags

| Flag | Purpose |
|------|---------|
| `--env` | Environment name |
| `--template` | Path to `.env.template` with `shelve://` references |
| `--offline` | Use encrypted cache only (no API) |
| `--no-cache` | Disable cache read/write |
| `--cache-ttl` | Cache freshness (`15m`, `2h`, `1d`; default 24h) |
| `--watch` | Poll Shelve; reload child on change |
| `--restart-on-change` | With `--watch`, respawn child instead of SIGHUP |

## Error codes (JSON / automation)

| Code | Meaning |
|------|---------|
| `AGENT_BLOCKED` | `pull` refused in agent shell without `--yes` |
| `AUTH_REQUIRED` | Missing token; set `SHELVE_TOKEN` or `login --token` |
| `MISSING_ENV` | Pass `--env` or set `defaultEnv` / `SHELVE_DEFAULT_ENV` |
| `MISSING_INPUT` | Required flag missing in non-interactive mode |
| `FETCH_FAILED` | `run` could not fetch secrets and cache unavailable |

## Configuration file

`shelve.json` in the project root (merged with monorepo root config):

```json
{
  "$schema": "https://shelve.cloud/schema.json",
  "slug": "my-team",
  "project": "my-app",
  "defaultEnv": "development",
  "confirmChanges": false,
  "autoCreateProject": true
}
```

## When to read reference files

- **`cli-commands.md`** — full command list, JSON shapes, exit codes
- **`agent-workflows.md`** — CI, monorepo, and AI agent patterns

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `shelve pull` in Cursor/Claude | Use `shelve run -- <cmd>` |
| CLI hangs waiting for input | Set `SHELVE_*` env vars + `--non-interactive` |
| `shelve run dev` exits instantly | Use `shelve run -- pnpm dev` or `--debug` |
| Secrets in git | Run `shelve init`; never commit `.env` |
