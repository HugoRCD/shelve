---
"@shelve/app": patch
---

API tokens are now verified by Better Auth's api-key plugin, on the existing `tokens` table. Existing `she_` tokens keep working: a migration re-encodes their stored hashes into the plugin's format. Scopes, IP allowlists and audit logs work as before. An expired token is now deleted the first time someone tries to use it.
