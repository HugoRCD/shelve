# SKILL: Conventional Commits & Versioning

A practical guide to conventional commits and automated versioning in monorepos using Changesets, enabling semantic releases and automated changelogs.

## Core Concepts

**Conventional Commits** is a specification for structured commit messages that enable automated versioning and changelog generation.

**Changesets** is a tool for managing versions and changelogs in monorepos, designed for npm packages.

**Key benefits:**
- Automated semantic versioning
- Generated changelogs
- Independent package versioning
- CI/CD-friendly release workflow

## Commit Message Format

**Structure:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
feat(cli): add support for environment variable sync

Implements automatic sync of environment variables from Shelve
to local .env files when running `shelve pull`.

Closes SHE-123
```

## Commit Types

**Standard types:**

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | Minor (0.x.0) |
| `fix` | Bug fix | Patch (0.0.x) |
| `breaking` | Breaking change | Major (x.0.0) |
| `docs` | Documentation only | None |
| `style` | Formatting, no code change | None |
| `refactor` | Code restructuring | None |
| `perf` | Performance improvement | Patch |
| `test` | Adding tests | None |
| `build` | Build system changes | None |
| `ci` | CI configuration changes | None |
| `chore` | Other changes | None |

**Breaking changes:**
```
feat(api)!: change authentication endpoint

BREAKING CHANGE: The /auth endpoint now requires OAuth2
instead of basic auth.
```

The `!` or `BREAKING CHANGE:` footer indicates a major version bump.

## Scope Patterns

**Align scopes with workspace packages:**

```
feat(app): add new dashboard widget
fix(cli): resolve config parsing issue
docs(lp): update landing page copy
build(types): add new shared interfaces
ci(vault): update deployment workflow
```

**Common scopes in Shelve:**
- `app` - Main application (`@shelve/app`)
- `cli` - Command-line interface (`@shelve/cli`)
- `lp` - Landing page (`@shelve/lp`)
- `vault` - Vault application (`@shelve/vault`)
- `types` - Shared types package
- `utils` - Shared utilities
- `base` - Base configuration layer

**No scope (affects entire monorepo):**
```
chore: update dependencies across all packages
```

## Changesets Integration

**Changesets config** (`.changeset/config.json`):

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.5/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Key settings:**
- `commit: false` - Don't auto-commit (manual control)
- `access: "public"` - Publish to npm as public
- `baseBranch: "main"` - Base branch for versioning
- `updateInternalDependencies: "patch"` - Bump dependents

## Changeset Workflow

**1. Make code changes**

**2. Create a changeset:**
```bash
pnpm changeset
```

Interactive prompts:
```
What kind of change is this?
  ○ patch - Bug fixes
  ○ minor - New features
  ○ major - Breaking changes

Which packages should be bumped?
  ◉ @shelve/cli
  ○ @shelve/app
  
Please enter a summary for this change:
> Add support for environment variable sync
```

**3. Commit the changeset:**
```bash
git add .changeset/
git commit -m "feat(cli): add environment variable sync"
```

**4. On release, consume changesets:**
```bash
pnpm changeset version
```

This:
- Bumps package versions
- Updates CHANGELOGs
- Removes consumed changesets

**5. Publish:**
```bash
pnpm changeset publish
git push --follow-tags
```

## Root Package Scripts

```json
{
  "scripts": {
    "release": "turbo run release && changeset"
  }
}
```

**The `release` script:**
- Runs package-specific release tasks (build, test)
- Opens changeset CLI for creating changesets

**Developers run:**
```bash
pnpm release
```

Then follow interactive prompts.

## Package-Level Release Scripts

**CLI package with tests:**
```json
{
  "scripts": {
    "release": "pnpm run test"
  }
}
```

**App package with build:**
```json
{
  "scripts": {
    "release": "pnpm run build && pnpm run typecheck"
  }
}
```

**Turborepo orchestrates** these via `turbo run release`.

## Changeset Files

**Example changeset file** (`.changeset/quick-foxes-jump.md`):

```markdown
---
"@shelve/cli": minor
---

Add support for environment variable sync

Implements automatic sync of environment variables from Shelve to local .env files.
```

**Multiple packages:**
```markdown
---
"@shelve/cli": minor
"@shelve/app": patch
---

Improve error handling across CLI and app

- CLI now shows user-friendly error messages
- App API returns structured error responses
```

## Version Bump Rules

**Semantic versioning (semver):**
- **Major (x.0.0):** Breaking changes
- **Minor (0.x.0):** New features (backward-compatible)
- **Patch (0.0.x):** Bug fixes (backward-compatible)

**Pre-1.0 projects:**
- Major bumps are still breaking
- Minor bumps can be breaking
- Patch bumps are safe

**Changesets handles:**
- Calculating new versions from changesets
- Updating dependent packages
- Generating CHANGELOG.md entries

## Linked Packages

**For packages that should always version together:**

```json
{
  "linked": [
    ["@shelve/app", "@shelve/lp", "@shelve/vault"]
  ]
}
```

**All packages in the linked array get the same version bump.**

**Use cases:**
- Shared UI components
- API client and server packages
- Tightly coupled packages

## Fixed Packages

**For packages that must have identical versions:**

```json
{
  "fixed": [
    ["@shelve/cli", "@shelve/types"]
  ]
}
```

**Stronger than linked** - enforces exact version matching.

## Internal Dependencies

**Update strategy:**

```json
{
  "updateInternalDependencies": "patch"
}
```

**Options:**
- `"patch"` - Bump dependents by patch (safest)
- `"minor"` - Bump dependents by minor
- `"major"` - Bump dependents by major (aggressive)

**Example:**
If `@shelve/types` bumps to `2.0.0`, packages depending on it get a patch bump (e.g., `1.0.1` → `1.0.2`).

## Ignoring Packages

**For private packages that shouldn't be versioned:**

```json
{
  "ignore": [
    "@shelve/base",
    "@shelve/app"
  ]
}
```

**Private packages** already marked `"private": true` don't need this.

## CI/CD Integration

**Release workflow (GitHub Actions):**

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**The action:**
- Detects changesets in main
- Creates release PR with version bumps
- Publishes when PR is merged

## Changelog Generation

**Changesets auto-generates** `CHANGELOG.md` per package:

```markdown
# @shelve/cli

## 4.2.0

### Minor Changes

- abc1234: Add support for environment variable sync

### Patch Changes

- def5678: Fix config parsing issue
- Updated dependencies
  - @shelve/types@2.0.0
```

**Format:**
- Groups by change type (Major, Minor, Patch)
- Includes git commit SHAs
- Lists dependency updates

## Best Practices

1. **Create changesets immediately** - Don't forget when merging PRs
2. **Write clear summaries** - Users read these in changelogs
3. **Use scopes consistently** - Match package names
4. **One changeset per logical change** - Easier to track
5. **Commit changesets with code** - Keep them together
6. **Run release script before publish** - Validates build/tests
7. **Use conventional commits** - Helps identify change type
8. **Link tightly coupled packages** - Version together
9. **Automate in CI** - Reduce manual release work
10. **Review generated CHANGELOGs** - Ensure clarity

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm changeset` | Create a new changeset |
| `pnpm changeset version` | Consume changesets, bump versions |
| `pnpm changeset publish` | Publish to npm |
| `pnpm release` | Run release tasks + create changeset |

| Commit Type | Version Bump |
|-------------|--------------|
| `feat` | Minor |
| `fix` | Patch |
| `breaking` or `!` | Major |
| `docs`, `style`, `chore` | None |

## Common Patterns

**Feature with changeset:**
```bash
# 1. Make changes
# 2. Create changeset
pnpm changeset
# Select: minor, @shelve/cli
# Summary: "Add environment sync"

# 3. Commit both
git add .
git commit -m "feat(cli): add environment variable sync"
```

**Bug fix with changeset:**
```bash
pnpm changeset
# Select: patch, @shelve/app
# Summary: "Fix memory leak in auth flow"

git add .
git commit -m "fix(app): resolve memory leak in authentication"
```

**Multi-package change:**
```bash
pnpm changeset
# Select: minor, @shelve/cli AND @shelve/types
# Summary: "Add new API client methods"

git add .
git commit -m "feat(cli,types): add new API client methods"
```

## When to Use This Skill

✅ **Use for:**
- npm packages (public or private)
- Monorepos with multiple publishable packages
- Teams that want automated versioning
- Projects with semantic versioning requirements

❌ **Don't use for:**
- Applications that don't publish to npm
- Single-package projects (use standard npm version)
- Projects with custom versioning schemes
- Teams that want manual version control
