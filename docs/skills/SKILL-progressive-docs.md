# SKILL: Progressive Documentation Architecture

A framework for creating AI-friendly documentation that minimizes cognitive load through progressive disclosure while maximizing actionability.

## Core Concept

**Progressive disclosure** means starting with essential information and revealing details only when needed. This prevents documentation overwhelm and helps AI agents (and humans) focus on what matters.

**Key principles:**
- **Start minimal** - Root entry point contains only critical, universal information
- **Link to details** - Provide clear paths to deeper documentation
- **Be actionable** - Every instruction must be specific and immediately usable
- **Centralize references** - Collect external links in one place
- **Self-update** - Document the documentation workflow itself

## Root Entry Point Pattern

The root `AGENTS.md` should be scannable in seconds:

```markdown
# AGENTS

Shelve is an open-source secrets management platform (web apps + CLI) built as a Turborepo monorepo.

- Package manager: pnpm (see `packageManager` in `package.json`).
- Non-standard build/typecheck commands:
`pnpm build` runs `turbo run build`.
`pnpm typecheck` runs `turbo run typecheck`.

More details (progressive disclosure):
- [Monorepo and layout](docs/agents/monorepo.md)
- [Commands and workflows](docs/agents/commands.md)
- [Tech stack](docs/agents/tech-stack.md)
- [NuxtHub usage](docs/agents/nuxthub.md)
- [Build env and outputs](docs/agents/build-env.md)
- [Reference docs](docs/agents/docs-links.md)
- [AI collaboration rules](docs/agents/ai-workflow.md)
```

**What goes in the root file:**
- Project type/description (one sentence)
- Critical non-standard conventions
- Links to detailed documentation (progressive disclosure)

**What doesn't go in the root file:**
- Detailed explanations
- Step-by-step tutorials
- Comprehensive lists
- Historical context

## Detailed Documentation Structure

Organize detailed docs in a subdirectory:

```
docs/
└── agents/
    ├── monorepo.md          # Workspace structure
    ├── commands.md          # Available commands
    ├── tech-stack.md        # Technologies used
    ├── nuxthub.md           # Framework-specific patterns
    ├── build-env.md         # Build configuration
    ├── docs-links.md        # External references
    └── ai-workflow.md       # Documentation maintenance
```

**Each file should:**
- Cover one specific topic
- Be skimmable with headers and lists
- Include concrete examples, not theory
- Link to other docs when needed

## Actionable Instructions Only

Every instruction must be immediately executable. Compare:

❌ **Vague:**
> "Use the database migration tool when schemas change."

✅ **Actionable:**
> "Generate migrations with `npx nuxt db generate`. Apply with `npx nuxt db migrate`."

❌ **Theoretical:**
> "KV is good for caching and read-heavy workloads."

✅ **Actionable:**
> "Use `@nuxthub/kv` for KV operations. Use `hub:kv` only for legacy Nuxt-only code paths."

**Recipe:** If an AI can't execute it without asking follow-up questions, it's not actionable enough.

## Example: Commands Documentation

**Structure commands as executable snippets:**

```markdown
# Commands and Workflows

- `pnpm dev` runs `turbo run dev --filter=@shelve/{app,lp}`.
- `pnpm dev:app` runs `turbo run dev --filter=@shelve/app`.
- `pnpm dev:lp` runs `turbo run dev --filter=@shelve/lp`.
- `pnpm build` runs `turbo run build`.
- `pnpm build:app` runs `turbo run build --filter=@shelve/app`.
- `pnpm lint` runs `turbo run lint`.
- `pnpm typecheck` runs `turbo run typecheck`.
```

**Benefits:**
- Copy-paste ready
- Shows command relationships
- No ambiguity about what each script does

## Reference Links Centralization

Collect external documentation links in a dedicated file:

```markdown
# Reference Documentation

## NuxtHub
- [NuxtHub Database](https://hub.nuxt.com/docs/features/database)
- [NuxtHub KV](https://hub.nuxt.com/docs/features/kv)
- [Drizzle ORM](https://orm.drizzle.team/)

## Nuxt
- [Nuxt Layers](https://nuxt.com/docs/guide/going-further/layers)
- [Nuxt Server Routes](https://nuxt.com/docs/guide/directory-structure/server)
- [Nitro OpenAPI](https://nitro.unjs.io/guide/openapi)

## Monorepo Tools
- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
```

**Why centralize?**
- Single file to update when links change
- Prevents duplicate links across multiple docs
- Makes link maintenance tractable
- AI can reference "see docs-links.md" instead of inline URLs

## Self-Updating Documentation Workflow

Document how to maintain the documentation itself:

```markdown
# AI Collaboration Rules

- If the user says a result is not what they want or asks for a change in approach, 
  propose updating `AGENTS.md` or a file in `docs/agents/` with a concrete patch 
  before repeating the mistake.
  
- Keep `AGENTS.md` minimal. Add non-universal guidance to a new or existing file 
  in `docs/agents/` and link it from `AGENTS.md`.
  
- Only add instructions that are specific and actionable. Avoid vague directives.

- When you are unsure where a new rule belongs, ask the user before editing the instructions.
```

**This enables:**
- Documentation evolution based on actual usage
- Prevents documentation drift
- Makes the documentation a living system
- AI agents can self-correct

## Progressive Disclosure in Practice

**Level 1 (Root):**
```markdown
- Package manager: pnpm
- Build: `pnpm build` runs `turbo run build`
```

**Level 2 (Detailed):**
```markdown
# Commands and Workflows

- `pnpm dev` runs `turbo run dev --filter=@shelve/{app,lp}`.
- `pnpm dev:app` runs `turbo run dev --filter=@shelve/app`.
...
```

**Level 3 (Reference):**
```markdown
# Reference Documentation
- [Turborepo Filtering](https://turbo.build/repo/docs/reference/run#--filter)
```

**When to use each level:**
- **L1**: Always-needed information (read on every task)
- **L2**: Context-specific information (read when relevant)
- **L3**: Deep dives and external resources (read rarely)

## Anti-Patterns

❌ **Long root file:**
> If `AGENTS.md` is > 50 lines, you're not being progressive enough.

❌ **Fluff and context:**
> "Historically, we used X, but then we moved to Y because..." → Cut this.

❌ **Vague instructions:**
> "Make sure to handle errors properly" → How? Show the pattern.

❌ **Scattered references:**
> Links to external docs sprinkled across multiple files → Centralize them.

❌ **Orphaned files:**
> Documentation files that aren't linked from anywhere → Remove or link them.

## Best Practices

1. **Root file < 50 lines** - If longer, split into detailed docs
2. **One topic per file** - Prevents files from becoming dumping grounds
3. **Examples over explanations** - Show the code/command, don't just describe it
4. **Update paths in links** - If moving files, update all references
5. **Version control matters** - Treat docs like code (review, commit, iterate)
6. **Test instructions** - If an instruction doesn't work, fix it immediately
7. **Delete outdated docs** - Stale information is worse than no information
8. **Use consistent naming** - `docs/agents/` not `docs/agent/` or `documentation/`

## Quick Reference

| Element | Purpose | Example |
|---------|---------|---------|
| Root entry point | Minimal critical info | `AGENTS.md` |
| Detail directory | Topic-specific docs | `docs/agents/` |
| Links file | External references | `docs-links.md` |
| Workflow file | Documentation maintenance | `ai-workflow.md` |
| Progressive disclosure | Link to details | "More: [topic](path)" |

## When to Use This Skill

✅ **Use for:**
- AI agent-friendly documentation
- Complex projects with many patterns
- Teams that iterate quickly
- Projects with non-obvious conventions

❌ **Don't use for:**
- Simple projects with obvious conventions
- Projects with comprehensive external docs
- Documentation meant for public consumption (use standard docs)
