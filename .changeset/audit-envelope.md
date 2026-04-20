---
"@shelve/app": minor
"@shelve/types": minor
---

Add audit logs and per-project envelope encryption.

**Audit logs**

- New `audit_logs` table records sensitive actions (token create/delete, variables read/write, environment/project mutations) with actor type/id, action, resource, IP, user agent, and arbitrary metadata. The `logAudit` helper swallows errors so logging never blocks the main request.
- New `GET /api/teams/[slug]/audit-logs` with cursor pagination and an `action` filter.
- New "Audit logs" tab in the team settings UI displays the stream with filters and pagination.

**Envelope encryption (DEK per project)**

- Each project gains an optional `encryptedDek` column. On the first write, a random 256-bit Data Encryption Key is generated, sealed with the platform Key Encryption Key (`useRuntimeConfig().private.encryptionKey`), and persisted alongside the project. Variables are then encrypted with the per-project DEK.
- Variables created before the upgrade keep working: decryption tries the project DEK first, then transparently falls back to the KEK. No data migration required.
- Sets up the foundations for per-project key rotation and BYOK without rewriting all variable ciphertexts at once.
