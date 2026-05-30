---
name: shelve-app
description: Use the Shelve web app and API concepts — teams, projects, environments, scoped tokens, audit logs, and encryption — when helping users manage secrets outside the CLI.
---

# Shelve app & platform

Shelve is a team secrets platform at [shelve.cloud](https://shelve.cloud). The **CLI** (`shelve` skill) syncs secrets locally; this skill covers the **dashboard and API model**.

Official docs: https://shelve.cloud/docs  
CLI skill: install with `npx skills add https://shelve.cloud` (skill `shelve`)

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

- Variables encrypted at rest (see [Encryption](/docs/core-features/encryption))
- [Audit logs](/docs/core-features/audit-logs) record token usage and changes
- Prefer **CLI `shelve run`** for agents — avoids writing `.env` to disk
- Run **`shelve init`** in repos so agents ignore secret files

## Typical user flows

### New developer on a project

1. Receive team invite / access in Shelve UI
2. Create scoped CLI token (read + write for their team/project if needed)
3. `export SHELVE_TOKEN=…` + `SHELVE_TEAM_SLUG` + `SHELVE_PROJECT`
4. `shelve init` in repo
5. `shelve run -- pnpm dev`

### CI pipeline

1. Store `SHELVE_TOKEN` in CI secrets (scoped to `ci` environment if possible)
2. Use [GitHub Action `shelve-run`](https://github.com/HugoRCD/shelve/tree/main/.github/actions/shelve-run) or `npx @shelve/cli run -- …`
3. Run `shelve doctor --json` in a setup step to fail fast

### Rotating a compromised secret

1. Update variable in Shelve UI (or `shelve push` from trusted machine)
2. Restart apps / CI — `shelve run --watch` picks up changes for long-running dev servers

## When to use CLI vs UI

| Task | Tool |
|------|------|
| Local dev with secrets | CLI `shelve run` |
| Bulk edit / review variables | Shelve UI |
| Create scoped CI token | Shelve UI |
| Audit who changed what | Shelve UI audit logs |
| Agent-safe workspace setup | CLI `shelve init` |

## Related documentation

- [Environments](/docs/core-features/environments)
- [API Tokens](/docs/core-features/tokens)
- [Audit logs](/docs/core-features/audit-logs)
- [CLI agents & automation](/docs/cli/agents-automation)
- [CLI troubleshooting](/docs/cli/troubleshooting)
