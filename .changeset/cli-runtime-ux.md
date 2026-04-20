---
"@shelve/cli": major
---

Make `shelve run` the default secret-injection path with offline support, secret references, watch mode, and AI-agent guards. Move CLI credentials to the OS keychain.

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
- `shelve pull` now detects AI-agent environments (`CURSOR_TRACE_ID`, `AIDER_VERSION`, `CLAUDECODE`, …) and prompts before writing plaintext secrets to disk (skip with `--yes`).
