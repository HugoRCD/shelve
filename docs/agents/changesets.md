# Changesets

Shelve uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

## When to add a changeset

Every feature, fix, or notable change **must** include a changeset. Run `pnpm changeset` from the repo root and select the affected packages:

- `@shelve/app` — for changes to the main Shelve application.
- `@shelve/cli` — for changes to the CLI (published to npm).

Choose the semver bump type (`patch`, `minor`, `major`) and write a short summary of the change.

## How it works

1. `pnpm changeset` creates a markdown file in `.changeset/` describing the change.
2. On push to `main`, the `release.yml` GitHub Action detects pending changesets and opens a **"Version packages"** PR that bumps versions and updates changelogs.
3. When that PR is merged, the action publishes `@shelve/cli` to npm (if bumped) and creates draft GitHub releases.

## Scripts

- `pnpm changeset` — create a new changeset.
- `pnpm version` — apply pending changesets (bump versions, update changelogs). Used by CI.
- `pnpm release` — build the CLI and publish to npm. Used by CI.

## What not to do

- Do not manually edit version fields in `package.json` — let changesets handle it.
- Do not skip the changeset for user-facing changes; CI will hold the release PR until one is added.
