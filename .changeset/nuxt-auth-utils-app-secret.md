---
"@shelve/app": patch
---

Fix sign-in after the nuxt-auth-utils 0.6 upgrade: read the session secret from `NUXT_APP_SECRET`, and keep API token sessions out of the response cookie
