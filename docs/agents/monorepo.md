# Monorepo and Layout

- Workspace: pnpm + Turborepo.
- Apps live in `apps/*`:
`apps/base`
`apps/lp`
`apps/shelve`
`apps/vault`
- Packages live in `packages/*`:
`packages/cli`
`packages/types`
`packages/utils`
- When a change is scoped to one app or package, prefer the targeted scripts in `package.json` (see `docs/agents/commands.md`).
