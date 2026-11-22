---
"@shelve/app": patch
---

Read request auth through one `getAuth`/`requireAuth` helper, and keep API token auth on the request instead of a throwaway session, as the first step of the move to Better Auth
