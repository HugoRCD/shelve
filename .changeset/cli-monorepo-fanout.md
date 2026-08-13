---
"@shelve/cli": minor
---

From a monorepo root, `push`, `pull`, `diff` and `sync` now run once per package that has its own `shelve.json`, and `--path <dir>` targets a single one. Root `shelve.json` settings reach sub-packages instead of being dropped, though `project` stays per-package.

Three things that were quietly broken now behave: `autoCreateProject: false` stops project creation even under `--yes`, `diff` no longer writes an empty env file or creates projects, and `shelve run` falls back to its encrypted cache when the API call fails instead of exiting.

Errors in `--json` mode now print the documented envelope on stderr rather than a stack trace. When a package fails partway through a fan-out, the error names it and lists the packages that already finished, in the prose hint and in `error.context`.
