---
"@shelve/app": major
"@shelve/cli": major
"@shelve/types": major
---

Harden API token storage, switch CLI auth to `Authorization: Bearer`, and add scoped tokens.

**Breaking — token format and storage**

- Tokens are now generated with `crypto.randomBytes(32)` + Crockford base32 (no more `Math.random`) and stored as `sha256(token)` alongside a non-secret prefix. Plaintext is returned **only at creation** and never readable again. Existing tokens are invalidated by the migration — re-issue them after upgrading.
- `GET /api/tokens` no longer returns plaintext token values; only `prefix`, `name`, `scopes`, `expiresAt`, `lastUsedAt`, `lastUsedIp` are exposed.
- Lookup is now an O(1) hash query with `timingSafeEqual` instead of decrypting every token in a loop.

**Breaking — CLI authentication**

- The CLI sends `Authorization: Bearer <token>` instead of `Cookie: authToken=…`. The cookie path still works for one release window with `Deprecation` and `Sunset` response headers.

**New — scoped tokens**

- Tokens carry granular scopes: `teamIds`, `projectIds`, `environmentIds`, and `permissions: ('read' | 'write')[]`. Scopes are enforced server-side via `requireTokenScope`.
- Tokens support an optional `expiresAt` and a CIDR `allowedCidrs` allowlist. `lastUsedAt` and `lastUsedIp` are written on each authenticated request.

The token UI (`/user/tokens` and the create dialog) shows the prefix instead of the full token, displays scopes/expiry/last-used columns, and reveals the secret value only once at creation.
