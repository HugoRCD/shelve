# @shelve/app

## 3.0.1

### Patch Changes

- [#735](https://github.com/HugoRCD/shelve/pull/735) [`7967ea5`](https://github.com/HugoRCD/shelve/commit/7967ea565728082f69b044dd757e92e633fd1242) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Add test coverage for the v5 token + auth surface: token generation and hashing invariants, `requireTokenScope` permission / team / project / environment matching, the tokens REST API (plaintext returned once, list hides secrets, bearer auth, cookie deprecation headers, read-only scope enforcement, expiry, revocation), and the `/audit-logs` endpoint (filtering + pagination). The CLI E2E flow now passes `--yes` to `pull` so it stays non-interactive when the harness runs inside an AI-agent environment.

## 3.0.0

### Major Changes

- [#732](https://github.com/HugoRCD/shelve/pull/732) [`5e8bf14`](https://github.com/HugoRCD/shelve/commit/5e8bf14fe612e2f281ee116cdfb82e54c7d4e1f6) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Harden API token storage, switch CLI auth to `Authorization: Bearer`, and add scoped tokens.

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

### Minor Changes

- [#733](https://github.com/HugoRCD/shelve/pull/733) [`658ebf1`](https://github.com/HugoRCD/shelve/commit/658ebf1e548a9e96998e71ddae8e54af1c24eddc) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Add audit logs and per-project envelope encryption.

  **Audit logs**

  - New `audit_logs` table records sensitive actions (token create/delete, variables read/write, environment/project mutations) with actor type/id, action, resource, IP, user agent, and arbitrary metadata. The `logAudit` helper swallows errors so logging never blocks the main request.
  - New `GET /api/teams/[slug]/audit-logs` with cursor pagination and an `action` filter.
  - New "Audit logs" tab in the team settings UI displays the stream with filters and pagination.

  **Envelope encryption (DEK per project)**

  - Each project gains an optional `encryptedDek` column. On the first write, a random 256-bit Data Encryption Key is generated, sealed with the platform Key Encryption Key (`useRuntimeConfig().private.encryptionKey`), and persisted alongside the project. Variables are then encrypted with the per-project DEK.
  - Variables created before the upgrade keep working: decryption tries the project DEK first, then transparently falls back to the KEK. No data migration required.
  - Sets up the foundations for per-project key rotation and BYOK without rewriting all variable ciphertexts at once.

### Patch Changes

- [#732](https://github.com/HugoRCD/shelve/pull/732) [`4c3fa8d`](https://github.com/HugoRCD/shelve/commit/4c3fa8d0dccff69aababbb3db5c2e562ba6322a7) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Fix `she_…undefined…` tokens: the Crockford base32 alphabet was missing two
  symbols (only 30 chars instead of 32), so two random bits per token mapped to
  `undefined` and ended up baked into the literal token string. Switched to the
  standard 32-char Crockford alphabet (`0-9` + `A-Z` minus `I/L/O/U`).

  Tokens generated before this fix (with `undefined` baked in) keep working —
  the hash is deterministic against whatever string was issued — but you should
  rotate them: they're shorter than advertised in entropy and noticeably ugly.

- [#729](https://github.com/HugoRCD/shelve/pull/729) [`5496a3b`](https://github.com/HugoRCD/shelve/commit/5496a3bcdd34eba0a3a57a52d2103a9402807723) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Fix the Vue warning `[Vue warn]: Missing required prop: "name"` when sending
  the welcome email: the template declared a required `name` prop but the
  `EmailService` passes `username` and `redirectUrl`. Aligned the props with
  what the service actually sends, and wired `redirectUrl` into the call-to-
  action button (it was hardcoded to `https://app.shelve.cloud` before).

- [#725](https://github.com/HugoRCD/shelve/pull/725) [`36f498f`](https://github.com/HugoRCD/shelve/commit/36f498f073acc41af97dc85c2ef3efee2007e478) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Improve variable creation form UX: cap textarea height, add visual separation between entries, and reposition controls
