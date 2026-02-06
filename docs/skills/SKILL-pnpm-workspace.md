# SKILL: pnpm Workspace Conventions

A practical guide to structuring pnpm workspaces with clear conventions for package organization, dependency management, and cross-package references.

## Core Concepts

**pnpm workspaces** enable multiple packages in a single repository with shared dependencies and fast, disk-efficient installs.

**Key benefits:**
- Disk space savings (shared dependencies via hard links)
- Fast installs (parallel + efficient linking)
- Strict dependency resolution (no phantom dependencies)
- Workspace protocol for local packages

## Workspace Structure

Define workspace packages in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'

onlyBuiltDependencies:
  - better-sqlite3
  - sharp
```

**Directory conventions:**
- `apps/*` - End-user applications (web apps, CLIs)
- `packages/*` - Reusable libraries and utilities

**Why separate apps and packages?**
- **Apps** are deployment targets (not published to npm)
- **Packages** are reusable code (may be published)
- Clear separation of concerns and responsibilities

## Package Naming with Scoped Prefixes

Use npm scopes to group related packages:

```json
{
  "name": "@shelve/app",
  "name": "@shelve/cli",
  "name": "@shelve/types",
  "name": "@shelve/base"
}
```

**Benefits:**
- Namespace collision prevention
- Clear ownership and project association
- Easier to identify internal vs external packages
- Consistent naming across the monorepo

**Naming pattern:** `@<org>/<package-name>`

## Cross-Package References

Reference workspace packages using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@shelve/cli": "workspace:*",
    "@shelve/types": "workspace:*",
    "lodash": "^4.17.21"
  }
}
```

**The `workspace:*` protocol:**
- Links to local packages during development
- Replaced with actual versions on publish
- Ensures you're always using the latest local code
- Works with semver ranges: `workspace:^1.0.0`

## Path Aliases for TypeScript

Configure path aliases in `tsconfig.json` to reference workspace packages:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@types": ["../../packages/types"],
      "@types/*": ["../../packages/types/*"]
    }
  }
}
```

**This enables clean imports:**
```typescript
import { User } from '@types/user'
// Instead of: import { User } from '../../packages/types/src/user'
```

## Built Dependency Handling

Some dependencies require native compilation. Configure them explicitly:

**In root `package.json`:**
```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "better-sqlite3",
      "sharp"
    ],
    "ignoredBuiltDependencies": [
      "@parcel/watcher",
      "esbuild",
      "vue-demi"
    ]
  }
}
```

**In `pnpm-workspace.yaml`:**
```yaml
onlyBuiltDependencies:
  - better-sqlite3
```

**Why this matters:**
- `onlyBuiltDependencies` - Only these packages run `postinstall` scripts
- `ignoredBuiltDependencies` - Skip building these (use pre-built binaries)
- Reduces install time and prevents build failures

## Lockfile and Version Pinning

**Lock the package manager version:**
```json
{
  "packageManager": "pnpm@10.28.2"
}
```

**Benefits:**
- Consistent installs across team and CI
- Prevents breaking changes from new pnpm versions
- Required by tools like Corepack

**Lockfile strategy:**
- Always commit `pnpm-lock.yaml`
- Never manually edit the lockfile
- Use `pnpm update` to bump dependencies
- Use `pnpm install --frozen-lockfile` in CI

## Package Visibility

**Private packages** (not published to npm):
```json
{
  "name": "@shelve/app",
  "private": true
}
```

**Public packages** (published to npm):
```json
{
  "name": "@shelve/cli",
  "version": "4.1.7",
  "publishConfig": {
    "access": "public"
  }
}
```

## Root Package Configuration

The root `package.json` orchestrates workspace tasks:

```json
{
  "name": "shelve",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "turbo run dev --filter=@shelve/{app,lp}",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "@shelve/cli": "workspace:*",
    "turbo": "^2.8.3",
    "typescript": "^5.9.3"
  }
}
```

**Root package should:**
- Be marked as `private: true`
- Define workspace-wide scripts
- Include dev dependencies used across all packages
- Reference published packages for testing

## Shared Types Package Pattern

Create a dedicated types package for shared TypeScript definitions:

**Directory structure:**
```
packages/types/
├── index.ts          # Main exports
├── schema.json       # JSON schema (optional)
└── src/
    ├── user.ts       # Domain types
    ├── api.ts        # API types
    └── config.ts     # Config types
```

**Example `index.ts`:**
```typescript
export * from './src/user'
export * from './src/api'
export * from './src/config'
```

**Consuming packages reference it:**
```json
{
  "devDependencies": {
    "@shelve/types": "workspace:*"
  }
}
```

**Why a separate types package?**
- Single source of truth for types
- No circular dependencies
- Easy to share types across apps and packages
- Can be published separately if needed

## pnpm Configuration Files

**`.npmrc` in root:**
```
auto-install-peers=true
shamefully-hoist=false
strict-peer-dependencies=false
```

**Common settings:**
- `auto-install-peers` - Automatically install peer dependencies
- `shamefully-hoist` - Hoist packages to root (avoid if possible)
- `strict-peer-dependencies` - Fail on peer dependency conflicts

## Best Practices

1. **Use `workspace:*`** for all internal package references
2. **Scope all packages** with a consistent org prefix (`@shelve/*`)
3. **Separate apps and packages** by deployment vs reusability
4. **Pin the package manager** in root `package.json`
5. **Configure built dependencies** explicitly to speed up installs
6. **Create a shared types package** for cross-package TypeScript types
7. **Mark apps as private** - only publish packages meant for distribution
8. **Use path aliases** in tsconfig for clean imports
9. **Commit the lockfile** - ensures reproducible installs

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| `packages/*` | Reusable libraries |
| `apps/*` | Deployable applications |
| `@org/name` | Scoped package naming |
| `workspace:*` | Reference local package |
| `onlyBuiltDependencies` | Control native builds |
| `packageManager: "pnpm@x"` | Lock pnpm version |
| `private: true` | Prevent npm publish |
| `paths: { "@pkg": [...] }` | TypeScript path aliases |

## When to Use This Skill

✅ **Use for:**
- JavaScript/TypeScript monorepos
- Projects with shared dependencies or utilities
- Teams that want strict dependency management
- Projects that benefit from disk space efficiency

❌ **Don't use for:**
- Single-package projects (no workspace needed)
- Polyglot monorepos (pnpm is Node.js-specific)
- Teams standardized on npm/yarn (avoid tool mixing)
