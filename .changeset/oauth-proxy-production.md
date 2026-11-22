---
"@shelve/app": patch
---

Production can now complete GitHub and Google sign-in for preview deployments that use Better Auth's OAuth proxy, when `OAUTH_PROXY_URL` and `OAUTH_PROXY_SECRET` are set. Production's own sign-in is unchanged.
