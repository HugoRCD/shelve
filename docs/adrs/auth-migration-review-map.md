# Auth Migration Review Map

This PR remains intentionally all-in-one, but review should be split into lanes to reduce noise.

Review order:
1. Auth core runtime changes
2. Mechanical migration artifacts
3. Non-auth feature/workspace changes

## Auth-Core Review Required

Focus first on these paths:

- `apps/shelve/package.json`
- `apps/shelve/nuxt.config.ts`
- `apps/shelve/types/auth-session.d.ts`
- `apps/shelve/server/middleware/auth-session.global.ts`
- `apps/shelve/server/utils/session.ts`
- `apps/shelve/server/db/schema.ts`
- `apps/shelve/server/services/user.ts`
- `apps/shelve/server/services/teams.ts`
- `apps/shelve/server/services/members.ts`
- `apps/shelve/server/services/invitations.ts`
- `apps/shelve/server/api/user/*.ts`
- `apps/shelve/server/api/admin/users/*.ts`
- `apps/shelve/server/api/invitations/[token]/*.ts`

Auth-core acceptance for this PR:

- Better Auth `0.0.2-alpha.24` migration works.
- Shelve keeps `getShelveSession()` semantics and token fallback.
- Session source tagging remains stable (`session` vs `token`).
- No user-facing auth behavior regressions.

## Mechanical Artifacts

Review second and treat as generated/mechanical:

- `apps/shelve/server/db/migrations/**`
- `apps/shelve/scripts/migration-*.mjs`
- `pnpm-lock.yaml`

## Non-Auth Follow-Up

Review last, not part of auth acceptance:

- `apps/shelve/app/**` (outside direct auth runtime paths)
- `packages/cli/**`
- `docs/agents/**`
- unrelated monorepo workflow/config updates

## Validation Status

Executed on branch `feat/better-auth-migration`:

- ✅ `pnpm --filter @shelve/app postinstall`
- ✅ `pnpm --filter @shelve/app typecheck`
- ⚠️ `pnpm --filter @shelve/app db:check:pre` requires `DATABASE_URL`
- ⚠️ `pnpm --filter @shelve/app db:check:post` requires `DATABASE_URL`
