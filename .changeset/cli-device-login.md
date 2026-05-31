---
"@shelve/cli": minor
"@shelve/app": minor
---

Add browser-based device login for the CLI (`shelve login` opens Shelve to approve; auto-creates a revocable CLI API token). Keeps `SHELVE_TOKEN`, `--token`, and `--with-token` for CI and manual tokens. Login and authorize pages show CLI-specific messaging when redirecting from the device flow.
