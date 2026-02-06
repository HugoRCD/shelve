# SKILL: NuxtHub Integration Best Practices

Practical patterns for using NuxtHub as a full-stack tooling layer with Nuxt, including database management, KV storage, and API configuration.

## Core Concept

**NuxtHub** is a Nuxt module that provides full-stack building blocks (database, KV, blob storage) that work across multiple hosting providers. Treat it as **tooling**, not a hosting platform.

**Key capabilities:**
- Database (PostgreSQL + Drizzle ORM)
- Key-Value storage (edge-compatible cache)
- Blob storage (file uploads)
- OpenAPI generation (via Nitro)

## NuxtHub Configuration

Enable NuxtHub features in `nuxt.config.ts`:

**Database (PostgreSQL + Drizzle):**
```typescript
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    db: 'postgresql'
  }
})
```

**Key-Value storage:**
```typescript
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    kv: true
  }
})
```

**Multiple features:**
```typescript
export default defineNuxtConfig({
  modules: ['@nuxthub/core'],
  hub: {
    db: 'postgresql',
    kv: true,
    blob: true
  }
})
```

## Database Schema Organization

**Schema location options:**

**Single file** (small projects):
```
server/db/schema.ts
```

**Directory structure** (larger projects):
```
server/db/schema/
├── index.ts          # Re-exports all schemas
├── users.ts          # User-related tables
├── projects.ts       # Project-related tables
└── audit.ts          # Audit log tables
```

**Example schema file:**
```typescript
import { pgTable, text, timestamp, uuid } from '@nuxthub/db/schema'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow()
})
```

**Schema best practices:**
- Use `@nuxthub/db/schema` imports (not `drizzle-orm/pg-core`)
- Name tables in snake_case for SQL conventions
- Always include timestamps (`createdAt`, `updatedAt`)
- Use UUID for primary keys unless you need auto-increment

## Drizzle ORM Migration Workflow

**NuxtHub generates Drizzle config automatically** - never create `drizzle.config.ts` manually.

### Development Workflow

**1. Update your schema:**
```typescript
// server/db/schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  // Add new field:
  role: text('role').notNull().default('user')
})
```

**2. Generate migration:**
```bash
npx nuxt db generate
```

This creates a migration file in `server/db/migrations/`.

**3. Apply migration:**

**Option A - Auto-apply in dev:**
```bash
npx nuxt dev
```
Dev server automatically applies pending migrations.

**Option B - Manual apply:**
```bash
npx nuxt db migrate
```

**Never hand-write migrations** in `server/db/migrations/`. Always use `nuxt db generate`.

### Production Workflow

**Apply migrations before deployment:**
```bash
npx nuxt db migrate --production
```

**Or use environment-specific commands:**
```json
{
  "scripts": {
    "db:migrate:prod": "DATABASE_URL=$PROD_DB_URL npx nuxt db migrate"
  }
}
```

## Database Access Patterns

**Import from NuxtHub:**
```typescript
import { db, schema } from '@nuxthub/db'

// Query
const users = await db.select().from(schema.users)

// Insert
await db.insert(schema.users).values({
  email: 'user@example.com',
  name: 'John Doe'
})

// Update
await db.update(schema.users)
  .set({ name: 'Jane Doe' })
  .where(eq(schema.users.id, userId))
```

**Legacy import (avoid in new code):**
```typescript
// ❌ Old way - avoid
const db = hubDatabase()
```

**Use the new imports:**
```typescript
// ✅ New way - preferred
import { db, schema } from '@nuxthub/db'
```

## KV Usage Patterns

**Import from NuxtHub:**
```typescript
import { kv } from '@nuxthub/kv'

// Set with TTL
await kv.set('cache:user:123', userData, { ttl: 3600 })

// Get
const data = await kv.get('cache:user:123')

// Delete
await kv.delete('cache:user:123')

// List keys
const keys = await kv.keys('cache:user:*')
```

**Legacy Nuxt-only import (use only for Nuxt-specific code):**
```typescript
// Use this only in Nuxt-specific contexts
import kv from 'hub:kv'
```

**Prefer `@nuxthub/kv`** - it's more flexible and works in non-Nuxt contexts.

### KV Best Practices

**Use KV for:**
- Short-lived cache (with TTL)
- Read-heavy data (avoid database load)
- Session storage
- Rate limiting counters

**Don't use KV for:**
- Transactional data (use database)
- Data that must be consistent immediately
- Large objects (> 25 MB limit)
- Data without expiration strategy

**Key naming conventions:**
```typescript
// Hierarchical keys with colons
'cache:user:123'
'session:abc123'
'ratelimit:api:user:456'
```

**Always set TTL:**
```typescript
// ✅ Good - has expiration
await kv.set('cache:data', data, { ttl: 3600 })

// ❌ Bad - no expiration (manual cleanup needed)
await kv.set('cache:data', data)
```

## OpenAPI Configuration

Enable OpenAPI generation via Nitro experimental flags:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    experimental: {
      openAPI: true
    }
  }
})
```

**Document routes with metadata:**
```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  defineRouteMeta({
    openAPI: {
      tags: ['Users'],
      summary: 'Get user by ID',
      parameters: [{
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string' }
      }]
    }
  })
  
  // Handler logic...
})
```

**Access OpenAPI spec:**
- Dev: `http://localhost:3000/_nitro/openapi.json`
- Prod: Built into `.output/` during build

## Server Route Conventions

**Route structure:**
```
server/
├── api/           # Public API routes
│   ├── users.get.ts
│   ├── users.post.ts
│   └── [id].get.ts
├── routes/        # Page routes (SSR)
│   └── sitemap.xml.ts
└── middleware/    # Server middleware
    └── auth.ts
```

**Naming convention:**
```
[resource].[method].ts
```

Examples:
- `users.get.ts` → GET /api/users
- `users.post.ts` → POST /api/users
- `users/[id].get.ts` → GET /api/users/:id
- `users/[id].delete.ts` → DELETE /api/users/:id

## Package Version Strategy

**Keep NuxtHub packages up-to-date:**
```json
{
  "dependencies": {
    "@nuxthub/core": "^0.10.6"
  }
}
```

**Why stay current:**
- Bug fixes and performance improvements
- Better TypeScript support
- New provider compatibility
- Security patches

**Only pin versions if:**
- Specific compatibility issue exists
- Awaiting fix for known bug
- Document the reason in comments

## Environment Variables

**NuxtHub looks for:**
```bash
# Database
DATABASE_URL=postgresql://...

# KV (if using external provider)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

**In development:**
- NuxtHub provides local SQLite/in-memory KV
- No external services needed
- Data resets on restart (use migrations for schemas)

## Common Pitfalls

❌ **Creating drizzle.config.ts manually**
- NuxtHub generates this automatically
- Manual config causes conflicts

❌ **Hand-writing SQL migrations**
- Use `nuxt db generate` instead
- Hand-written migrations can break schema sync

❌ **Using legacy APIs in new code**
```typescript
// ❌ Avoid
const db = hubDatabase()

// ✅ Use
import { db } from '@nuxthub/db'
```

❌ **No TTL on KV entries**
- Results in unbounded growth
- Always set expiration for cache entries

❌ **Using KV for transactional data**
- KV is eventually consistent
- Use database for critical data

## Best Practices

1. **Never create drizzle.config.ts** - NuxtHub handles this
2. **Use `nuxt db generate` for migrations** - Don't hand-write SQL
3. **Prefer new imports** - `@nuxthub/db`, `@nuxthub/kv` over legacy
4. **Set TTL on all KV entries** - Prevent unbounded growth
5. **Organize schemas by domain** - Use `server/db/schema/` directory
6. **Auto-apply migrations in dev** - `nuxt dev` handles this
7. **Document API routes** - Use `defineRouteMeta({ openAPI: ... })`
8. **Keep packages updated** - Unless specific compatibility reason
9. **Use environment variables** - Never hardcode connection strings

## Quick Reference

| Task | Command/Pattern |
|------|----------------|
| Generate migration | `npx nuxt db generate` |
| Apply migration | `npx nuxt db migrate` |
| Auto-apply in dev | `npx nuxt dev` |
| DB import | `import { db, schema } from '@nuxthub/db'` |
| KV import | `import { kv } from '@nuxthub/kv'` |
| Set KV with TTL | `await kv.set(key, value, { ttl: 3600 })` |
| Enable OpenAPI | `nitro.experimental.openAPI: true` |

## When to Use This Skill

✅ **Use for:**
- Nuxt 3 full-stack applications
- Projects needing database + cache
- Multi-provider deployment scenarios
- Teams wanting framework-integrated tools

❌ **Don't use for:**
- Non-Nuxt projects
- Projects with existing database setup (e.g., Prisma)
- Serverless-incompatible workloads
