# Reusable AI Skills

This directory contains standalone, portable skill files extracted from the Shelve project. Each skill codifies battle-tested patterns that can be applied to any compatible project.

## Available Skills

### [Turborepo Monorepo Patterns](SKILL-turborepo-monorepo.md)
Learn how to structure Turborepo monorepos with optimal task dependency graphs, caching strategies, filtered commands, and standardized conventions.

**Use for:** JavaScript/TypeScript monorepos with multiple packages and shared dependencies.

**Key topics:**
- Task dependency graphs with `dependsOn`
- Output caching patterns (`.vercel/output/**`, `.nuxt/**`, `dist/**`)
- Environment variable tracking in builds
- Filtered commands (`--filter=@scope/pkg`)
- Standardized script conventions across packages

---

### [pnpm Workspace Conventions](SKILL-pnpm-workspace.md)
Practical guide to structuring pnpm workspaces with clear conventions for package organization, dependency management, and cross-package references.

**Use for:** Node.js monorepos requiring efficient disk usage and strict dependency management.

**Key topics:**
- Workspace structure (`apps/*` vs `packages/*`)
- Scoped package naming (`@org/package`)
- Cross-package references with `workspace:*` protocol
- Built dependency handling
- Lockfile and version pinning strategies

---

### [Progressive Documentation Architecture](SKILL-progressive-docs.md)
Framework for creating AI-friendly documentation that minimizes cognitive load through progressive disclosure while maximizing actionability.

**Use for:** Complex projects with many patterns, AI agent integration, or rapidly iterating teams.

**Key topics:**
- Minimal root entry point pattern
- Detailed documentation in subdirectories
- Actionable instructions only (no fluff)
- Reference links centralization
- Self-updating documentation workflow

---

### [NuxtHub Integration Best Practices](SKILL-nuxthub-integration.md)
Practical patterns for using NuxtHub as a full-stack tooling layer, including database management, KV storage, and API configuration.

**Use for:** Nuxt 3 full-stack applications needing database, cache, or multi-provider deployment.

**Key topics:**
- Database schema organization patterns
- Drizzle ORM migration workflow (`nuxt db generate` → `nuxt db migrate`)
- KV usage patterns (`@nuxthub/kv` over legacy imports)
- OpenAPI configuration via Nitro
- Server route conventions

---

### [Monorepo TypeScript Configuration](SKILL-monorepo-typescript.md)
Best practices for TypeScript configuration in monorepos, including config inheritance, cross-package references, and framework-specific patterns.

**Use for:** TypeScript monorepos with shared type definitions and multiple frameworks.

**Key topics:**
- Config inheritance with `extends`
- Cross-package type references via path aliases
- Framework-specific tsconfig extensions (e.g., `.nuxt/tsconfig.json`)
- Strict mode and bundler module resolution
- Shared types package pattern

---

### [Conventional Commits & Versioning](SKILL-conventional-commits.md)
Practical guide to conventional commits and automated versioning in monorepos using Changesets, enabling semantic releases and automated changelogs.

**Use for:** npm packages (public or private) with semantic versioning requirements.

**Key topics:**
- Conventional commit format and types
- Changesets integration for monorepo versioning
- Scope patterns aligned with packages
- Automated changelog generation
- CI/CD release workflow

---

### [Shared Code Quality Configuration](SKILL-code-quality.md)
Maintain consistent code quality across a monorepo using shared linting, formatting, and style configurations.

**Use for:** Monorepos with multiple contributors requiring consistent code style.

**Key topics:**
- Monorepo-wide ESLint with shared config packages
- EditorConfig for editor-agnostic formatting
- Consistent linting rules across all packages
- Base layer pattern for shared framework config
- Pre-commit hooks with lint-staged

---

## How to Use These Skills

### For AI Agents
1. Reference the relevant skill file in your agent context
2. The skill contains actionable patterns with code examples
3. Apply the patterns to your current project
4. Adapt examples to your specific needs

### For Developers
1. Read the skill that matches your use case
2. Follow the patterns and examples
3. Copy-paste configurations where applicable
4. Customize to your project's needs

### Progressive Disclosure
Each skill follows the progressive disclosure pattern:
- **Summary** - Quick overview of when to use
- **Core concepts** - Fundamental ideas
- **Patterns** - Concrete code examples
- **Best practices** - Dos and don'ts
- **Quick reference** - Tables and cheatsheets

## Skill Creation Guidelines

When creating new skills or updating existing ones:

1. **Be actionable** - Every instruction should be immediately executable
2. **Include examples** - Show real code from actual projects
3. **Follow progressive disclosure** - Summary → Details → Reference
4. **No fluff** - Cut theoretical explanations, show practical patterns
5. **Standalone** - Each skill should be self-contained
6. **Portable** - Applicable to any compatible project, not just Shelve

## Why These Skills Matter

These patterns were developed and refined over time in the Shelve project. Extracting them as reusable skills means:

- **Consistent quality** across all projects
- **Faster onboarding** for AI agents and developers
- **Living library** of battle-tested conventions
- **Less time** re-explaining the same patterns
- **Portable knowledge** that travels with you

## References

- **How to make good skills:** [skills.sh/anthropics/skills/skill-creator](https://skills.sh/anthropics/skills/skill-creator)
- **Shelve repository:** [github.com/HugoRCD/shelve](https://github.com/HugoRCD/shelve)

## Contributing

To add or update skills:

1. Create a new `SKILL-[name].md` file following the pattern
2. Update this README with a summary
3. Ensure examples are accurate and tested
4. Follow the progressive disclosure format
5. Keep it actionable and fluff-free
