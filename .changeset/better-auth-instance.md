---
"@shelve/app": patch
---

Add the Better Auth schema (sessions, verifications, OAuth token columns on accounts, `emailVerified` on users) and mount a Better Auth instance on the existing tables at `/api/auth/*`. Logins still use the current flow.
