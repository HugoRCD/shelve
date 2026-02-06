# SKILL: Shared Code Quality Configuration

Best practices for maintaining consistent code quality across a monorepo using shared linting, formatting, and style configurations.

## Core Concepts

**Shared configurations** ensure all packages follow the same code quality standards without duplicating configuration files.

**Key benefits:**
- Consistent code style across all packages
- Single source of truth for rules
- Easy updates (change once, apply everywhere)
- Onboarding clarity (one set of rules to learn)

## Monorepo-Wide ESLint

**Root ESLint config** (`eslint.config.js`):

```javascript
import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  features: {
    packageJson: {
      enabled: false
    }
  }
})
```

**Using a shared config package:**
- `@hrcd/eslint-config` - Custom shared configuration
- Could also use `@antfu/eslint-config`, `@nuxt/eslint-config`, etc.
- Centralizes all linting rules in one package

**Benefits:**
- One config to maintain
- Consistent across projects
- Version controlled separately
- Can be published to npm

## Shared Config Package Pattern

**Create a dedicated config package:**

```
@org/eslint-config/
├── package.json
├── index.js              # Main config
└── rules/
    ├── typescript.js     # TypeScript rules
    ├── vue.js            # Vue rules
    └── node.js           # Node.js rules
```

**Package.json:**
```json
{
  "name": "@hrcd/eslint-config",
  "version": "3.0.3",
  "main": "index.js",
  "peerDependencies": {
    "eslint": "^9.0.0"
  },
  "dependencies": {
    "eslint-plugin-vue": "^9.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

**Index.js exports config:**
```javascript
export function createConfig(options = {}) {
  return [
    // Base rules
    {
      rules: {
        'no-console': 'warn',
        'no-debugger': 'error'
      }
    },
    // TypeScript rules
    ...(options.typescript ? [tsRules] : []),
    // Framework rules
    ...(options.vue ? [vueRules] : [])
  ]
}
```

## Package-Level ESLint Scripts

**Every package should have:**

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  }
}
```

**Root orchestration via Turborepo:**
```json
{
  "scripts": {
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix"
  }
}
```

**Developers run:**
```bash
pnpm lint          # Check all packages
pnpm lint:fix      # Auto-fix all packages
pnpm lint --filter=@shelve/app  # Check specific package
```

## EditorConfig for Consistent Formatting

**Root `.editorconfig`:**

```ini
root = true

[*]
indent_size = 2
indent_style = space
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

**What this configures:**
- **indent_size: 2** - 2-space indentation (common in JS/TS)
- **indent_style: space** - Spaces over tabs
- **end_of_line: lf** - Unix-style line endings (not CRLF)
- **charset: utf-8** - UTF-8 encoding
- **trim_trailing_whitespace** - Remove trailing spaces
- **insert_final_newline** - Ensure files end with newline

**Exception for markdown:**
- Preserve trailing spaces (Markdown formatting)

**Why EditorConfig?**
- Works across all editors (VS Code, IntelliJ, Vim, etc.)
- Overrides editor defaults
- No per-editor configuration needed
- Committed to repo (team consistency)

## Base Layer Pattern for Shared App Config

**Create a base package** for shared Nuxt/app configuration:

```
apps/base/
├── package.json
├── nuxt.config.ts        # Shared Nuxt config
└── app.config.ts         # Shared app config
```

**Base `nuxt.config.ts`:**
```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxthub/core'
  ],
  
  // Shared configuration
  ui: {
    icons: ['heroicons', 'lucide']
  },
  
  // Shared build settings
  nitro: {
    compressPublicAssets: true
  }
})
```

**Apps extend the base:**
```typescript
// apps/app/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../base'],
  
  // App-specific overrides
  hub: {
    db: 'postgresql'
  }
})
```

**Benefits:**
- Shared dependencies (UI library, modules)
- Consistent configuration baseline
- App-specific overrides when needed
- DRY principle for config

## Base Package Structure

**Base package.json:**
```json
{
  "name": "@shelve/base",
  "type": "module",
  "private": true,
  "main": "./nuxt.config.ts",
  "scripts": {
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  },
  "dependencies": {
    "@nuxt/ui": "^4.4.0",
    "@nuxt/content": "^3.11.2",
    "@nuxthub/core": "^0.10.6",
    "nuxt": "4.3.0",
    "vue": "^3.5.27"
  }
}
```

**Key points:**
- `main: "./nuxt.config.ts"` - Points to shared config
- `private: true` - Not published to npm
- Contains shared dependencies
- Has lint scripts (still checked)

## Consistent Linting Rules

**Common ESLint rules for monorepos:**

```javascript
export default {
  rules: {
    // Code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/consistent-type-imports': 'error',
    
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off'
  }
}
```

**Rule categories:**
- **Code quality** - Prevent bugs
- **Best practices** - Modern JavaScript patterns
- **TypeScript** - Type safety
- **Framework** - Vue, React, etc.

## Git Hooks for Enforcement

**Use Husky + lint-staged:**

```json
{
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "lint-staged": {
    "*.{js,ts,vue}": "eslint --fix",
    "*.{json,md}": "prettier --write"
  }
}
```

**Pre-commit hook** runs linters on staged files:
```bash
pnpm lint-staged
```

**Benefits:**
- Catch issues before commit
- Auto-fix simple problems
- Faster than full repo lint
- Forces quality at commit time

## Prettier Integration

**Root `.prettierrc`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Integrate with ESLint:**
```javascript
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default [
  {
    plugins: {
      prettier: eslintPluginPrettier
    },
    rules: {
      'prettier/prettier': 'error'
    }
  }
]
```

**Or run separately:**
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## Turborepo Task Configuration

**Wire up linting in `turbo.json`:**

```json
{
  "tasks": {
    "lint": {
      "dependsOn": ["transit"]
    },
    "lint:fix": {}
  }
}
```

**`dependsOn: ["transit"]`** ensures preparation tasks run first (e.g., Nuxt types generation).

## TypeScript Consistency

**Shared tsconfig patterns:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Benefits:**
- Catches more bugs
- Enforces type safety
- Consistent across packages

## Ignoring Files

**Root `.eslintignore`:**
```
dist
.nuxt
.output
.vercel
node_modules
*.min.js
```

**Root `.gitignore`:**
```
node_modules
dist
.nuxt
.output
.vercel
.DS_Store
*.log
.env*
!.env.example
```

**Keep them in sync** - files not in git usually shouldn't be linted.

## Best Practices

1. **Use a shared ESLint config** - Single source of truth
2. **Configure EditorConfig** - Works in all editors
3. **Create a base layer** - For shared framework config
4. **Run lint in CI** - Fail builds on violations
5. **Use lint-staged** - Catch issues at commit time
6. **Keep rules consistent** - Don't override in packages
7. **Auto-fix when possible** - `eslint --fix` in pre-commit
8. **Enforce with CI** - Don't merge failing lint
9. **Document exceptions** - If you must disable rules
10. **Update shared config regularly** - Keep rules modern

## Quick Reference

| File | Purpose |
|------|---------|
| `eslint.config.js` | Root ESLint configuration |
| `.editorconfig` | Editor formatting rules |
| `apps/base/` | Shared framework configuration |
| `@org/eslint-config` | Shareable ESLint package |
| `.prettierrc` | Code formatting rules |
| `lint-staged` | Pre-commit linting |

| Pattern | Use Case |
|---------|----------|
| Shared ESLint config | Consistent rules across packages |
| EditorConfig | Editor-agnostic formatting |
| Base layer | Shared framework config |
| Turborepo task deps | Lint after type generation |
| Pre-commit hooks | Enforce quality at commit |

## Example: Full Setup

**Root `eslint.config.js`:**
```javascript
import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  features: {
    packageJson: { enabled: false }
  }
})
```

**Root `.editorconfig`:**
```ini
root = true

[*]
indent_size = 2
indent_style = space
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

**Package scripts:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  }
}
```

**Root orchestration:**
```json
{
  "scripts": {
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix"
  }
}
```

## When to Use This Skill

✅ **Use for:**
- Monorepos with multiple packages
- Teams requiring consistent code style
- Projects with multiple contributors
- Open-source projects (clear expectations)

❌ **Don't use for:**
- Single-developer projects (overhead)
- Prototypes (premature optimization)
- Projects with incompatible tools (conflicting configs)
