---
"@shelve/cli": patch
---

Fix `shelve -v` reporting the cwd project version instead of the CLI version. Fix `shelve login` storing credentials in the legacy `~/.shelve` path while API calls read from XDG/keyring storage.
