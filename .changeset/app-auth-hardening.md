---
"@shelve/app": patch
---

Tighten sign-in and account checks. Self-hosted instances outside Vercel must now set `NUXT_PUBLIC_APP_URL`, and `NUXT_PRIVATE_TRUST_PROXY` when they run behind a reverse proxy.
