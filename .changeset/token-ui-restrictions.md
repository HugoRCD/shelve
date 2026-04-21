---
"@shelve/app": minor
---

Two related UI improvements around the v5 security surface.

**Tokens**

- Token creation now exposes the full scope surface that the backend already supports: restrict a token to specific **teams**, **projects**, and **environments** via cascading multi-select pickers, and add an **IP allowlist** (CIDR ranges) with inline validation.
- A clear "unscoped token" warning when no restriction is applied.
- The tokens table shows what each token is actually scoped to (teams / projects / envs / CIDRs counts) instead of a generic "scoped" badge.
- The popover form was replaced with a roomier modal so the new options have space to breathe. `Token.allowedCidrs` is now part of the public `Token` type.

**Audit logs**

- Color-coded action badges (create=success, delete=error, update / token.* = warning, auth.* = info) and resource icons (variable / environment / project / token / …).
- Actor badges include a matching icon (`user`, `key-round`, `cpu`).
- IP rendered as a monospace pill.
- The very long raw `User-Agent` string is parsed to a friendly client label (e.g. `Shelve CLI 5.0.0`, `Chrome 147 · macOS`, `Node.js`, `curl 8.6.0`) with the full UA available on hover.
- New per-row metadata popover (`{}` icon) showing the full JSON payload for that event, instead of having no way to inspect it.
- Empty state and centered "Load more" button.
