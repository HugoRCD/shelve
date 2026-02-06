# SKILL: Monorepo TypeScript Configuration

Best practices for TypeScript configuration in monorepos, including config inheritance, cross-package references, and framework-specific patterns.

## Core Concepts

**TypeScript in monorepos** requires careful configuration to enable:
- Shared compiler options across packages
- Cross-package type references
- Framework-specific type generation
- Optimal editor experience
- Fast type checking

**Key patterns:**
- Config inheritance (DRY principle)
- Path aliases for cross-package imports
- Framework-generated tsconfig (e.g., Nuxt's `.nuxt/tsconfig.json`)
- Shared types package for common definitions

## Root TypeScript Configuration

**Root `tsconfig.json` extends a package's config:**

```json
{
  "extends": "./apps/shelve/tsconfig.json"
}
```

**Why extend from an app?**
- Provides default types for the entire monorepo
- Editors can resolve types from root
- Enables workspace-wide find/replace
- Fallback for files not in a package

**Alternative: Base config pattern**
```json
{
  "extends": "./tsconfig.base.json"
}
```

## Package-Level Configuration

**Basic package tsconfig:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

**Key compiler options:**
- `moduleResolution: "bundler"` - For modern bundlers (Vite, esbuild)
- `strict: true` - Enable all strict checks
- `noEmit: true` - Type checking only (build tool handles emit)
- `skipLibCheck: true` - Faster checks (skip node_modules)

## Cross-Package Type References

**Configure path aliases for workspace packages:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@types": ["../../packages/types"],
      "@types/*": ["../../packages/types/*"],
      "@utils": ["../../packages/utils/src"],
      "@utils/*": ["../../packages/utils/src/*"]
    }
  }
}
```

**This enables clean imports:**
```typescript
// Instead of:
import { User } from '../../packages/types/src/user'

// Write:
import { User } from '@types/user'
```

**Path alias best practices:**
- Match npm package names (`@types` → `@shelve/types`)
- Point to source, not dist (types resolve from source)
- Use wildcard patterns (`@types/*`) for subdirectories
- Keep aliases consistent across packages

## Framework-Specific Config Extensions

**Nuxt auto-generates tsconfig:**

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@types": ["../../packages/types"],
      "@types/*": ["../../packages/types/*"]
    }
  }
}
```

**The `.nuxt/tsconfig.json` provides:**
- Auto-imports from Nuxt modules
- Component type definitions
- Server/client type splitting
- Composables and plugins

**Why extend it?**
- Nuxt regenerates this file on changes
- Contains framework-specific types
- Keeps your config minimal

**Similar patterns exist for:**
- Next.js: `"extends": "next"`
- SvelteKit: Auto-generated types in `.svelte-kit/`
- Astro: `"extends": "astro/tsconfigs/strictest"`

## Shared Types Package Pattern

**Create a dedicated types package:**

```
packages/types/
├── index.ts           # Main exports
├── tsconfig.json      # Types package config
└── src/
    ├── user.ts        # Domain types
    ├── api.ts         # API contracts
    └── config.ts      # Config types
```

**Types package `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Main export file:**
```typescript
// packages/types/index.ts
export * from './src/user'
export * from './src/api'
export * from './src/config'
```

**Consuming packages:**
```json
{
  "dependencies": {
    "@shelve/types": "workspace:*"
  }
}
```

**Benefits:**
- Single source of truth for types
- No circular dependencies
- Can generate `.d.ts` files for distribution
- Shared across all packages

## Server-Specific TypeScript Config

**Nuxt server routes may have their own tsconfig:**

```
apps/shelve/
├── tsconfig.json              # Client + server
└── server/
    └── tsconfig.json          # Server-only types
```

**Server `tsconfig.json`:**
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["node"],
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**Why separate?**
- Different runtime (Node.js vs browser)
- Different available globals
- Server-only type checking

## Type Checking in Monorepos

**Root package script:**
```json
{
  "scripts": {
    "typecheck": "turbo run typecheck"
  }
}
```

**Package-level script:**
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**Turborepo orchestrates:**
- Runs typecheck in all packages
- Parallelizes where possible
- Shows which package failed

**Why `--noEmit`?**
- Build tools (Vite, esbuild) handle compilation
- TypeScript is just for type checking
- Faster checks (no emit overhead)

## Strict Mode Configuration

**Enable progressively:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**For existing codebases, enable gradually:**
```json
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true  // Start with this
  }
}
```

**Then progressively enable more checks.**

## Build vs Check Configuration

**Some packages build, others only check:**

**CLI package (builds):**
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "noEmit": false
  }
}
```

**App package (doesn't build):**
```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

**Why the difference?**
- Apps use bundlers (Nuxt, Vite) for builds
- Libraries need `.d.ts` for consumers
- Type checking still happens either way

## Common Pitfalls

❌ **Duplicating configs across packages**
```json
// ❌ Repeated config in every package
{
  "compilerOptions": { /* 50 lines of options */ }
}
```

✅ **Use extends:**
```json
// ✅ Share via extends
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { /* only overrides */ }
}
```

❌ **Forgetting path aliases in consuming packages**
```typescript
// ❌ Works in one app, breaks in another
import { User } from '@types'
```

✅ **Configure paths in all consuming packages:**
```json
{
  "compilerOptions": {
    "paths": { "@types": ["../../packages/types"] }
  }
}
```

❌ **Pointing paths to dist instead of src**
```json
// ❌ Types won't resolve during development
"paths": { "@types": ["../../packages/types/dist"] }
```

✅ **Point to source:**
```json
// ✅ Types resolve from source files
"paths": { "@types": ["../../packages/types"] }
```

## Best Practices

1. **Use config inheritance** - DRY principle with `extends`
2. **Enable strict mode** - Catch errors early
3. **Configure path aliases** - Match npm package names
4. **Point to source files** - Not dist for path aliases
5. **Use `noEmit: true` for apps** - Let bundlers handle compilation
6. **Extend framework configs** - Leverage auto-generated types
7. **Create shared types package** - Single source of truth
8. **Skip lib check** - Faster checks with `skipLibCheck: true`
9. **Use bundler resolution** - `moduleResolution: "bundler"` for modern tools
10. **Separate server configs** - When server/client types differ

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| `extends: "./pkg/tsconfig.json"` | Root config inherits from app |
| `extends: "./.nuxt/tsconfig.json"` | Use framework-generated types |
| `paths: { "@pkg": ["../../packages/pkg"] }` | Cross-package imports |
| `noEmit: true` | Type checking only (bundler builds) |
| `strict: true` | Enable all strict checks |
| `skipLibCheck: true` | Faster checks |
| `moduleResolution: "bundler"` | Modern bundler support |
| `declaration: true` | Generate .d.ts files |

## Example: Full App Config

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@types": ["../../packages/types"],
      "@types/*": ["../../packages/types/*"],
      "@utils": ["../../packages/utils/src"],
      "@utils/*": ["../../packages/utils/src/*"]
    },
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": [
    "**/*",
    "../../packages/types/**/*"
  ],
  "exclude": [
    "node_modules",
    ".nuxt",
    ".output"
  ]
}
```

## When to Use This Skill

✅ **Use for:**
- TypeScript monorepos
- Projects with shared type definitions
- Teams using multiple frameworks
- Codebases requiring strict type safety

❌ **Don't use for:**
- Single-package TypeScript projects
- JavaScript-only monorepos
- Projects not using TypeScript
