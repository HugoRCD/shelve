# ADR: Auth Session Store Baseline

## Status
Accepted

## Context
Shelve runs Better Auth 1.5 beta with NuxtHub and currently persists sessions in PostgreSQL. The migration baseline was consolidated to a single compatibility drift migration (`0004_puzzling_darkhawk.sql`) and validated by auth migration e2e coverage.

## Decision
Use DB-backed Better Auth sessions as the default baseline (`session` table).

CLI token auth remains intentional product behavior and stays isolated in app session resolution as a fallback path (`source: "token"`).

## Rationale
- DB-backed sessions are already stable in production-like flows.
- This migration phase is focused on compatibility and idempotency, not storage strategy expansion.
- Introducing KV-backed sessions now would increase blast radius across SSR/auth/runtime paths.

## Deferred Option: NuxtHub KV Session Strategy
A follow-up spike may evaluate KV-backed session/cache behavior when module/runtime constraints are clear.

Evaluation checklist:
- Confirm Better Auth and `@onmax/nuxt-better-auth` support a safe KV store/session adapter path.
- Validate SSR auth consistency and no regression in `event.context.appSession` hydration.
- Verify CLI token fallback behavior remains unchanged.
- Measure migration and rollback complexity before adopting KV in production.
