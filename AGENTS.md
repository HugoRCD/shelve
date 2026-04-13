# AGENTS

Shelve is an open-source secrets management platform (web apps + CLI) built as a Turborepo monorepo.

- Package manager: pnpm (see `packageManager` in `package.json`).
- Non-standard build/typecheck commands:
`pnpm build` runs `turbo run build`.
`pnpm typecheck` runs `turbo run typecheck`.
- Every feature, fix, or notable change **must** include a changeset (`pnpm changeset`). See [Changesets](docs/agents/changesets.md).

More details (progressive disclosure):
- [Monorepo and layout](docs/agents/monorepo.md)
- [Commands and workflows](docs/agents/commands.md)
- [Changesets](docs/agents/changesets.md)
- [Tech stack](docs/agents/tech-stack.md)
- [NuxtHub usage](docs/agents/nuxthub.md)
- [Build env and outputs](docs/agents/build-env.md)
- [Reference docs](docs/agents/docs-links.md)
- [AI collaboration rules](docs/agents/ai-workflow.md)
