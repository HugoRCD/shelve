---
"@shelve/app": patch
"@shelve/cli": patch
---

API tokens are now API keys, verified by Better Auth's api-key plugin. The `tokens` table becomes `api_keys`, with the plugin's field names. Existing `she_` keys keep working: a migration re-encodes their stored hashes into the plugin's format. Scopes, IP allowlists and audit logs work as before. The page moves to `/user/api-keys`, and `/user/tokens` redirects to it. An expired key is now deleted the first time someone tries to use it.
