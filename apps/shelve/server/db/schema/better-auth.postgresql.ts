import { relations, sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  bigint,
  timestamp,
  boolean,
  uuid,
  index,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

// Keep this schema aligned with:
// - migrations: 0003_better_auth.sql + 0004_better_auth_admin.sql
// - Better Auth adapter options: usePlural=false, camelCase=true
export const user = pgTable(
  'user',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('emailVerified').default(false).notNull(),
    name: varchar('name', { length: 255 }),
    image: text('image'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),

    // App-specific fields configured via `user.additionalFields` in `server/auth.config.ts`.
    role: text('role').default('user').notNull(),
    banned: boolean('banned').default(false),
    banReason: text('banReason'),
    banExpires: timestamp('banExpires'),
    authType: text('authType').default('email').notNull(),
    onboarding: boolean('onboarding').default(false).notNull(),
    cliInstalled: boolean('cliInstalled').default(false).notNull(),
    legacyId: bigint('legacyId', { mode: 'number' }).unique(),
  },
  (table) => [uniqueIndex('user_legacyId_uidx').on(table.legacyId)],
)

export const session = pgTable(
  'session',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonatedBy'),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: uuid('id').default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

