---
"@shelve/app": patch
---

Fix stale variable reads after a write, by reading a project's variables from the database instead of each server instance's own cache
