# @shelve/cli

## 4.2.0

### Minor Changes

- Support variable groups and descriptions in `.env` file output. Pulled variables are now organized by group with section headers (`# ---- Group ----`) and inline description comments. The `pull` command also auto-generates a `.env.example` file alongside the `.env` file.

## 4.1.7

### Patch Changes

- a84dc7f: fix: allow global commands (login, logout, me) to work without package.json
