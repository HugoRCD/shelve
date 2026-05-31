---
name: shelve
description: Complete guide to Shelve — team secrets platform, CLI (@shelve/cli), sync policies, scoped tokens, shelve run for agents/CI, push/pull/diff, and the web app. Install with npx skills add https://shelve.cloud
---

# Shelve

Shelve is an open-source **team secrets platform**: web app + CLI. Store variables per team, project, and environment; inject at runtime without committing `.env` files.

- **Docs:** https://shelve.cloud/docs
- **CLI docs:** https://shelve.cloud/docs/cli
- **Install / update this skill:** `npx skills add https://shelve.cloud`
- **Catalog:** https://shelve.cloud/.well-known/skills/index.json

## Security rules (read first)

1. **Prefer `shelve run -- <cmd>`** — secrets stay in the child process; no `.env` on disk.
2. **Avoid `shelve pull` in agent shells** — writes plaintext secrets agents can read. Use `--yes` only if the user explicitly needs a disk file; run `shelve init` first.
3. **Never commit** `SHELVE_TOKEN`, `.env`, or `~/.shelve/` cache.
4. **Never print secret values** in logs, JSON, or commits. CLI `--json` excludes values by design.
5. Run **`shelve init`** once per workspace before secret operations.
6. **Protect production:** use `sync.protectedEnvironments` in `shelve.json` and/or project Settings → Sync policy.

## Platform (teams, tokens, UI)

| Concept | CLI / config |
|---------|----------------|
| Team | `slug` in `shelve.json`, `SHELVE_TEAM_SLUG` |
| Project | `project`, `SHELVE_PROJECT` |
| Environment | `--env`, `defaultEnv`, `SHELVE_DEFAULT_ENV` |
| API token | `SHELVE_TOKEN` — create at https://app.shelve.cloud/user/tokens (shown once; scope read/write + team/project/env) |

**CLI vs UI:** bulk edit and audit logs → UI; local dev and CI → CLI `run`. Details: **`platform.md`**.

## Non-interactive / agents

Run **`shelve doctor --json`** first in automation.

| Variable | Purpose |
|----------|---------|
| `SHELVE_TOKEN` | API token |
| `SHELVE_TEAM_SLUG` | Team slug |
| `SHELVE_PROJECT` | Project name |
| `SHELVE_DEFAULT_ENV` | Default environment |
| `SHELVE_URL` | Instance (default `https://app.shelve.cloud`) |

| Flag | Effect |
|------|--------|
| `--json` | Machine-readable stdout; JSON errors on stderr |
| `--quiet` / `-q` | No spinners |
| `--yes` / `-y` | Skip confirmations |
| `--non-interactive` | Fail instead of prompt |
| `--debug` | Verbose (`SHELVE_DEBUG=1`) |

Auto non-interactive when `CI=true`, agent shell detected, or `AI_AGENT` is set.

## Command cheat sheet

```bash
# Preferred: inject secrets
shelve run -- pnpm dev
shelve run --env preview -- pnpm build
shelve run dev                    # package.json script shortcut

shelve init                       # agent ignores + .gitignore block
shelve login                      # browser device flow (humans)
shelve login --token "$SHELVE_TOKEN"  # CI / automation
shelve doctor --json
shelve --json config

# Sync
shelve diff --env staging
shelve push --env development --yes
shelve pull --env development --yes   # risky in agent shells
shelve sync --dry-run --env production

shelve create --name my-app --slug my-team
shelve generate --type env-example
```

## `shelve run` flags

| Flag | Purpose |
|------|---------|
| `--env` | Environment |
| `--template` | `.env.template` with `shelve://` refs |
| `--offline` | Encrypted cache only |
| `--no-cache` | Disable cache |
| `--cache-ttl` | e.g. `15m`, `24h` default |
| `--watch` | Reload on remote changes |
| `--restart-on-change` | Respawn child instead of SIGHUP |

## Sync policies (`shelve.json`)

```json
{
  "$schema": "https://shelve.cloud/schema.json",
  "slug": "my-team",
  "project": "my-app",
  "defaultEnv": "development",
  "sync": {
    "protectedEnvironments": ["production"],
    "environments": {
      "development": { "sourceOfTruth": "local" },
      "production": { "sourceOfTruth": "remote", "allowPush": false, "pullMode": "merge" }
    }
  }
}
```

See **`sync-policies.md`** and https://shelve.cloud/docs/cli/sync-policies

## Error codes

| Code | Meaning |
|------|---------|
| `AGENT_BLOCKED` | `pull` in agent shell without `--yes` |
| `AUTH_REQUIRED` | Missing token |
| `MISSING_ENV` | No `--env` / `defaultEnv` |
| `FETCH_FAILED` | API/cache failure in `run` |
| `PUSH_BLOCKED` / `PULL_BLOCKED` | Sync policy |
| `SYNC_CONFLICT` | `onPushConflict: fail` or prompt in CI |
| `ENV_PROTECTED` | Server blocked push to protected env |

## Reference files (read when needed)

| File | Contents |
|------|----------|
| **`cli-commands.md`** | All commands, JSON shapes, config keys |
| **`agent-workflows.md`** | CI, GitHub Actions, monorepo, templates, watch |
| **`platform.md`** | Teams, tokens, encryption, UI flows |
| **`sync-policies.md`** | Push/pull conflict rules, `diff` / `sync` |

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `shelve pull` in Cursor/Claude | `shelve run -- <cmd>` |
| CLI hangs | `SHELVE_*` + `--non-interactive` |
| Push overwrites prod | `protectedEnvironments` + `shelve diff` first |
| Secrets in git | `shelve init`; never commit `.env` |
