# SKILL: Turborepo Monorepo Patterns

A comprehensive guide to structuring Turborepo monorepos with optimal task dependency graphs, caching strategies, and standardized conventions.

## Core Concepts

**Turborepo** orchestrates tasks across a monorepo using a dependency graph. Tasks run in parallel when possible, with caching to skip redundant work.

**Key benefits:**
- Incremental builds (only rebuild what changed)
- Remote caching (share build artifacts across team/CI)
- Parallel execution with dependency awareness
- Consistent task naming across packages

## Task Dependency Graph

Define tasks in `turbo.json` with explicit dependencies using `dependsOn`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".vercel/output/**", ".output/**", ".nuxt/**"],
      "env": ["DATABASE_URL", "NUXT_SESSION_PASSWORD"]
    },
    "typecheck": {
      "dependsOn": ["transit"]
    },
    "lint": {
      "dependsOn": ["transit"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Dependency patterns:**
- `"^build"` - Run `build` in all dependencies first (topological order)
- `"transit"` - Run `transit` in current package first (preparation step)
- No `dependsOn` - Can run immediately in parallel

## Output Caching Patterns

Specify outputs for each task to enable intelligent caching:

**Framework-specific outputs:**
```json
{
  "build": {
    "outputs": [
      ".vercel/output/**",  // Vercel deployment artifacts
      ".output/**",          // Nuxt/Nitro build output
      ".nuxt/**",            // Nuxt build cache
      "dist/**"              // Generic build output
    ]
  }
}
```

**Turbo tracks these outputs to:**
- Skip rebuilds when nothing changed
- Restore cached outputs instantly
- Share artifacts across machines via remote cache

## Environment Variable Tracking

Track environment variables that affect build output:

```json
{
  "build": {
    "env": [
      "DATABASE_URL",
      "KV_URL",
      "KV_REST_API_TOKEN",
      "NUXT_SESSION_PASSWORD",
      "NUXT_PUBLIC_PAYLOAD_ID",
      "NUXT_PRIVATE_ENCRYPTION_KEY",
      "SKIP_ENV_VALIDATION"
    ]
  }
}
```

**When any tracked env var changes, Turbo invalidates the cache.**

## Filtered Commands for Focused Development

Use `--filter` to run tasks in specific packages:

```json
{
  "scripts": {
    "dev": "turbo run dev --filter=@shelve/{app,lp}",
    "dev:app": "turbo run dev --filter=@shelve/app",
    "build:cli": "turbo run build --filter=@shelve/cli"
  }
}
```

**Filter patterns:**
- `--filter=@scope/pkg` - Single package
- `--filter=@scope/{app,lp}` - Multiple packages
- `--filter=./packages/*` - All packages in directory
- `--filter=[main]` - Only changed packages vs main branch

## Standardized Script Conventions

Maintain consistent script names across all packages:

**Required scripts in every package:**
- `dev` - Start development server
- `build` - Production build
- `lint` - Run linter
- `lint:fix` - Auto-fix linting issues
- `typecheck` - Type checking without emitting

**Optional scripts:**
- `test` - Run tests
- `release` - Prepare for release
- `generate` - Generate static output
- `preview` - Preview production build

**Example package.json:**
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "typecheck": "tsc --noEmit"
  }
}
```

## Cache Configuration

**Persistent tasks** (long-running dev servers):
```json
{
  "dev": {
    "cache": false,
    "persistent": true
  }
}
```

**Non-cacheable tasks:**
```json
{
  "dev:prepare": {
    "cache": false
  }
}
```

## Best Practices

1. **Always use `^dependsOn`** for tasks that require dependencies to build first (e.g., `build`, `generate`)
2. **Be specific with outputs** - Include all generated files/directories
3. **Track build-affecting env vars** - Prevents stale cache issues
4. **Use filters in CI** - Only test/build changed packages
5. **Name scripts consistently** - Makes the monorepo predictable
6. **Disable cache for dev tasks** - Prevent confusion with hot reload
7. **Mark servers as persistent** - Prevents Turbo from killing them prematurely

## Integration with Package Manager

Root `package.json` delegates to Turbo:

```json
{
  "scripts": {
    "dev": "turbo run dev --filter=@shelve/{app,lp}",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

**Developers run:** `pnpm dev` → Turbo orchestrates → Runs tasks in correct order

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| `dependsOn: ["^build"]` | Build dependencies first |
| `dependsOn: ["transit"]` | Run local prep step first |
| `cache: false` | Disable caching (dev, CI-only) |
| `persistent: true` | Long-running process (dev server) |
| `outputs: ["dist/**"]` | Files to cache |
| `env: ["VAR"]` | Invalidate cache when var changes |
| `--filter=pkg` | Run task in specific package |

## When to Use This Skill

✅ **Use for:**
- JavaScript/TypeScript monorepos with multiple packages
- Projects with shared dependencies (design systems, utilities)
- Teams that need consistent build processes
- CI pipelines that benefit from caching

❌ **Don't use for:**
- Single-package projects (unnecessary overhead)
- Polyglot monorepos (Turbo is JS-focused)
- Projects without significant interdependencies
