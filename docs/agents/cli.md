# Shelve CLI — agents & automation

Use this guide when driving `@shelve/cli` from scripts, CI, or AI agents inside the Shelve monorepo.

**Public documentation:** [shelve.cloud/docs/cli/agents-automation](https://shelve.cloud/docs/cli/agents-automation)

**Install the agent skill** (published via Docus at `/.well-known/skills/`):

```bash
npx skills add https://shelve.cloud
```

Catalog: `https://shelve.cloud/.well-known/skills/index.json` (single skill: `shelve` — CLI + platform)

## Recommended workflow

1. Run **`shelve doctor --json`** to validate config, auth, API, and cache.
2. Set credentials and project context with environment variables (no prompts):
   - `SHELVE_TOKEN`
   - `SHELVE_TEAM_SLUG`
   - `SHELVE_PROJECT`
   - `SHELVE_DEFAULT_ENV` (optional)
   - `SHELVE_URL` (optional, defaults to `https://app.shelve.cloud`)
3. Run **`shelve init`** once per workspace (writes agent ignore files).
4. Prefer **`shelve run -- <cmd>`** so secrets stay in memory — avoid **`shelve pull`** in agent shells.
5. Use **`--json`** when you need machine-readable output.
6. Use **`--non-interactive`** (or rely on agent/CI auto-detection) so missing flags fail fast instead of hanging on prompts.

## Global flags

These flags can appear before or after the subcommand (parsed from `process.argv`):

| Flag | Alias | Effect |
|------|-------|--------|
| `--json` | | Success → JSON on stdout `{ ok, command?, data? }`. Errors → JSON on stderr `{ ok: false, error: { code, message, status?, hint? } }`. |
| `--quiet` | `-q` | No clack intro/outro/spinners. |
| `--yes` | `-y` | Skip confirmation prompts (`pull`, `push`, etc.). |
| `--non-interactive` | | Fail with `MISSING_*` / `AUTH_REQUIRED` instead of prompting. |
| `--debug` | | Verbose logs (`SHELVE_DEBUG=1`, `DEBUG=true` also work). |

Auto non-interactive when:

- `CI=true` / `CI=1`
- `std-env` detects an agent shell (`cursor`, `claude`, …)
- `AI_AGENT` is set

## Command-specific flags

| Command | Flags |
|---------|-------|
| `login` | Browser device flow by default; `--token` / `SHELVE_TOKEN` / `--with-token` for automation |
| `push` / `pull` | `--env`, `--yes` |
| `create` | `--name`, `--slug` |
| `generate` | `--type env-example \| eslint` |
| `init` | `--cwd` |
| `run` | `--env`, `--template`, `--offline`, `--no-cache`, `--cache-ttl`, `--watch`, `--restart-on-change` |

## JSON output (no secret values)

| Command | `data` shape |
|---------|----------------|
| `doctor` | `{ healthy, checks[], exitCodes, errorCodes }` |
| `config` | merged config, token redacted as `***` |
| `me` | `{ loggedIn, username?, email? }` |
| `push` / `pull` | `{ env, variableCount, pushed?, file?, keys? }` — never includes values |
| `init` | `{ writtenFiles, skippedFiles, gitignoreUpdated }` |
| `login` | `{ username, email }` |
| `create` | `{ name, slug, configPath }` |
| `logout` | `{ loggedOut: true }` |
| `generate` | `{ type, path }` |
| `upgrade` | `{ previous, current, updated }` |

`run` keeps the child process stdio inherited. Startup errors are structured on stderr; with `--json`, a spawn event is also emitted on stderr: `{ ok: true, event: "child_spawned", env, variableCount, keys, command, pid }`.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | CLI / API / config error |
| `128 + n` | Child signal (`run`) |
| `129` | Parent gone / stdin EIO |
| `130` / `143` | SIGINT / SIGTERM |

## Examples

```bash
shelve --json config
shelve --non-interactive --yes push --env staging
SHELVE_TOKEN=… shelve run -- pnpm dev
```

## Local testing

```bash
pnpm play
pnpm play -- --json config
```

See [`playground/run/README.md`](../../playground/run/README.md).

## Skill source in this repo

The published skill lives at [`apps/lp/skills/shelve/`](../../apps/lp/skills/shelve/) (`SKILL.md` + reference files) and is served by Docus at build time. There is only one skill (`shelve`), not separate CLI/app skills.
