# Shelve platform (app & API)

Official docs: https://shelve.cloud/docs

## Core concepts

| Concept | Description |
|---------|-------------|
| **Team** | Workspace boundary; identified by `slug` in CLI config |
| **Project** | App or repo within a team; maps to `SHELVE_PROJECT` / `shelve.json` `project` |
| **Environment** | Named set of variables (`development`, `preview`, `production`, …) |
| **Variable** | Key/value secret; may belong to a group with description |

## Tokens (CLI & API auth)

Create at [app.shelve.cloud/user/tokens](https://app.shelve.cloud/user/tokens):

- Plaintext shown **once** at creation — store in CI secrets as `SHELVE_TOKEN`
- Scoped: `read` / `write`, optional team/project/environment IDs
- Optional expiry and IP allowlist
- Send as `Authorization: Bearer <token>`

**Never** commit tokens, log them, or put them in agent prompts.

## Security model

- Variables encrypted at rest — https://shelve.cloud/docs/core-features/encryption
- Audit logs record token usage and changes — https://shelve.cloud/docs/core-features/audit-logs
- Prefer **CLI `shelve run`** for agents — avoids writing `.env` to disk
- Run **`shelve init`** in repos so agents ignore secret files
- **Project sync policy** (Settings → Sync policy): `protectedEnvironments` blocks API/CLI push server-side

## Typical user flows

### New developer on a project

1. Receive team invite / access in Shelve UI
2. Create scoped CLI token (read + write for their team/project if needed)
3. `export SHELVE_TOKEN=…` + `SHELVE_TEAM_SLUG` + `SHELVE_PROJECT`
4. `shelve init` in repo
5. `shelve run -- pnpm dev`

### CI pipeline

1. Store `SHELVE_TOKEN` in CI secrets (scoped to `ci` environment if possible)
2. Use GitHub Action `shelve-run` or `npx @shelve/cli run -- …`
3. Run `shelve doctor --json` in a setup step to fail fast

### Rotating a compromised secret

1. Update variable in Shelve UI (or `shelve push` from trusted machine)
2. Restart apps / CI — `shelve run --watch` picks up changes for long-running dev servers

## CLI vs UI

| Task | Tool |
|------|------|
| Local dev with secrets | CLI `shelve run` |
| Bulk edit / review variables | Shelve UI |
| Create scoped CI token | Shelve UI |
| Audit who changed what | Shelve UI audit logs |
| Agent-safe workspace setup | CLI `shelve init` |
| Block push to production | UI sync policy + `shelve.json` `sync` |

## Documentation links

- Environments — https://shelve.cloud/docs/core-features/environments
- API Tokens — https://shelve.cloud/docs/core-features/tokens
- Audit logs — https://shelve.cloud/docs/core-features/audit-logs
- CLI agents & automation — https://shelve.cloud/docs/cli/agents-automation
- Sync policies — https://shelve.cloud/docs/cli/sync-policies
