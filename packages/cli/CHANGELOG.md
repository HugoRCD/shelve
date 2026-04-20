# @shelve/cli

## 5.0.1

### Patch Changes

- [#734](https://github.com/HugoRCD/shelve/pull/734) [`d63f766`](https://github.com/HugoRCD/shelve/commit/d63f76639df8b635f1b58e4def4e2be4e3aef7b9) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Add test coverage for the v5 additions — encrypted offline cache (roundtrip / TTL / token rotation / tampering), OS-keychain credentials with XDG file fallback and legacy `~/.shelve` migration, agent-ignore files, `shelve://` secret references, and `parseDuration`. Along the way, `CredentialsService` now creates `$XDG_CONFIG_HOME` on demand so writes no longer fail on freshly provisioned machines.

## 5.0.0

### Major Changes

- [#731](https://github.com/HugoRCD/shelve/pull/731) [`af6266e`](https://github.com/HugoRCD/shelve/commit/af6266e3c9a0d1a5fee17ba19bea0334bda4625b) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Make `shelve run` the default secret-injection path with offline support, secret references, watch mode, and AI-agent guards. Move CLI credentials to the OS keychain.

  **OS keychain storage**

  - The CLI now stores its API token in the OS keychain via `@napi-rs/keyring` (macOS Keychain, libsecret, Windows Credential Manager). The fallback file is XDG-compliant (`~/.config/.shelve`, mode `0600`) and the legacy `~/.shelve` is migrated automatically on first read.
  - `rc9.readUser` / `rc9.writeUser` are deprecated; we now use `readUserConfig` / `writeUserConfig`.
  - `shelve logout` clears both the keychain entry and the rc file.

  **Encrypted offline cache**

  - After every successful pull, `shelve run` writes an AES-256-GCM cache at `~/.shelve/cache/<sha256(team:project:env)>.json.enc`, with the key derived from the API token via HKDF. Revoking the token makes the cache unreadable.
  - New flags: `--offline` (force cache, fail if absent), `--no-cache` (never read or write), `--cache-ttl 24h` (override freshness).
  - If the API call fails, `shelve run` transparently falls back to a fresh-enough cache and prints a warning instead of crashing.

  **Secret references**

  - `shelve run --template .env.template` resolves `shelve://<team>/<project>/<env>/<KEY>` references against the live or cached secrets, leaving literal values untouched. The template file can be safely committed to Git.

  **Watch mode**

  - `shelve run --watch` polls Shelve for variable changes and forwards `SIGHUP` to the child on update (let Vite/Nuxt/Next handle the reload). Use `--restart-on-change` to instead kill and respawn.

  **AI-agent guards**

  - New `shelve init` writes `.cursorignore`, `.aiderignore`, `.codeiumignore`, `.continueignore`, and a `# shelve-managed-block` in `.gitignore` to keep `.env` out of model contexts.
  - `shelve pull` now detects AI-agent environments via [`std-env`](https://github.com/unjs/std-env) (`cursor`, `claude`, `devin`, `replit`, `gemini`, `codex`, `auggie`, `opencode`, `kiro`, `goose`, `pi`) and prompts before writing plaintext secrets to disk (skip with `--yes`). Set `AI_AGENT=<name>` to force-detect.

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

### Patch Changes

- [#730](https://github.com/HugoRCD/shelve/pull/730) [`59d2bf3`](https://github.com/HugoRCD/shelve/commit/59d2bf3141ba2de6a9964115eb25163a3b3b0956) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Fix `shelve run` subprocess handling and add missing dependencies.

  - Switch from `tinyexec` + `tree-kill` to `node:child_process.spawn` with proper process-group signal forwarding (`process.kill(-pid, signal)` on POSIX). Resolves the long-standing `childPid` bug where signals were never propagated and child trees were left as zombies.
  - Drop the implicit `npx` fallback (~200 ms cold start, broken signals) and use the local `node_modules/.bin/nr` directly when shorthand commands like `pnpm dev` are passed.
  - Declare `tinyexec` and `consola` as direct dependencies of `@shelve/cli`. They were transitive-only before, so installs under npm/yarn/bun broke as soon as pnpm hoisting wasn't there to save the day.

- [#732](https://github.com/HugoRCD/shelve/pull/732) [`4c3fa8d`](https://github.com/HugoRCD/shelve/commit/4c3fa8d0dccff69aababbb3db5c2e562ba6322a7) Thanks [@HugoRCD](https://github.com/HugoRCD)! - Fix `she_…undefined…` tokens: the Crockford base32 alphabet was missing two
  symbols (only 30 chars instead of 32), so two random bits per token mapped to
  `undefined` and ended up baked into the literal token string. Switched to the
  standard 32-char Crockford alphabet (`0-9` + `A-Z` minus `I/L/O/U`).

  Tokens generated before this fix (with `undefined` baked in) keep working —
  the hash is deterministic against whatever string was issued — but you should
  rotate them: they're shorter than advertised in entropy and noticeably ugly.

## 4.2.0

### Minor Changes

- Support variable groups and descriptions in `.env` file output. Pulled variables are now organized by group with section headers (`# ---- Group ----`) and inline description comments. The `pull` command also auto-generates a `.env.example` file alongside the `.env` file.

## 4.1.7

### Patch Changes

- a84dc7f: fix: allow global commands (login, logout, me) to work without package.json
