---
"@shelve/app": minor
---

Sign in with Better Auth: GitHub, Google and email codes now create database sessions that can be revoked, and nuxt-auth-utils is removed. Everyone signs in once after this release. Preview deployments can use GitHub and Google login through production with `OAUTH_PROXY_URL` and `OAUTH_PROXY_SECRET`.
