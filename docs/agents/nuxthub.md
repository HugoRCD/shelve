# NuxtHub Usage

NuxtHub is used as a Nuxt module to provide full-stack building blocks across providers. Treat it as tooling, not a hosting platform.

Repo usage:
- `apps/shelve/nuxt.config.ts`: `hub: { db: 'postgresql' }`.
- `apps/vault/nuxt.config.ts`: `hub: { kv: true }`.
- Keep NuxtHub packages on the latest stable release unless there is a compatibility reason to pin.

Database (NuxtHub DB + Drizzle):
- Do not create `drizzle.config.ts` manually. NuxtHub generates it.
- Define schema in `server/db/schema.ts` or `server/db/schema/`.
- Do not hand-write SQL migrations in `server/db/migrations/`.
- Generate migrations with `npx nuxt db generate`.
- Apply migrations with `npx nuxt db migrate` or let `npx nuxt dev` auto-apply them.
- Use `db` and `schema` from `@nuxthub/db` (or `hub:db` for legacy).
- Avoid legacy `hubDatabase()` APIs in new code.

KV access:
- Prefer `@nuxthub/kv` for KV operations. Use `hub:kv` only for legacy Nuxt-only code paths.
- KV is best for cache-like or read-heavy data. Plan for eventual consistency and TTL-based expirations.
- Respect KV limits (key length and value size).

API and OpenAPI:
- `apps/shelve/nuxt.config.ts` enables Nitro OpenAPI via `nitro.experimental.openAPI`.
- Use `defineRouteMeta({ openAPI: ... })` to keep the API spec clean and stable.

Reference docs live in `docs/agents/docs-links.md`.
