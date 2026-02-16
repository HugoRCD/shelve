import { boolean, pgEnum, pgTable, varchar, index, uniqueIndex, bigint, integer, timestamp, uuid, text } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { TeamRole, InvitationStatus } from '../../../../packages/types'

// Better Auth core tables are defined here so app tables and app services share one source of truth.
// `server/db/schema/better-auth.postgresql.ts` re-exports these symbols for backward-compatible imports.
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

const timestamps = {
  updatedAt: timestamp().notNull().$onUpdate(() => new Date()),
  createdAt: timestamp().defaultNow().notNull(),
}

const DEFAULT_LOGO = 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true'

export const teamRoleEnum = pgEnum('team_role', [
  TeamRole.OWNER,
  TeamRole.ADMIN,
  TeamRole.MEMBER,
])

export const invitationStatusEnum = pgEnum('invitation_status', [
  InvitationStatus.PENDING,
  InvitationStatus.ACCEPTED,
  InvitationStatus.DECLINED,
  InvitationStatus.EXPIRED,
])
export const githubApp = pgTable('github_app', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  installationId: bigint({ mode: 'number' }).notNull(),
  isOrganisation: boolean().default(false).notNull(),
  userId: uuid().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  ...timestamps,
})

export const teams = pgTable('teams', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  slug: varchar({ length: 50 }).unique().notNull(),
  logo: varchar({ length: 500 }).default('https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true').notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('teams_slug_idx').on(table.slug)])

export const members = pgTable('members', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  userId: uuid().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('members_user_team_idx').on(table.userId, table.teamId),
  index('members_role_idx').on(table.role),
  index('members_team_role_idx').on(table.teamId, table.role)
])

export const invitations = pgTable('invitations', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  email: varchar({ length: 255 }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
  token: varchar({ length: 64 }).unique().notNull(),
  status: invitationStatusEnum().default(InvitationStatus.PENDING).notNull(),
  invitedById: uuid().references(() => user.id, { onDelete: 'set null' }),
  expiresAt: timestamp().notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('invitations_token_idx').on(table.token),
  uniqueIndex('invitations_email_team_idx').on(table.email, table.teamId),
  index('invitations_team_idx').on(table.teamId),
  index('invitations_status_idx').on(table.status),
])

export const projects = pgTable('projects', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  description: varchar({ length: 500 }).default('').notNull(),
  repository: varchar({ length: 200 }).default('').notNull(),
  projectManager: varchar({ length: 200 }).default('').notNull(),
  homepage: varchar({ length: 200 }).default('').notNull(),
  variablePrefix: varchar({ length: 500 }).default('').notNull(),
  logo: varchar({ length: 500 }).default(DEFAULT_LOGO).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('projects_team_name_idx').on(table.teamId, table.name),
  index('projects_team_idx').on(table.teamId),
])

export const variables = pgTable('variables', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  projectId: bigint({ mode: 'number' }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  key: varchar({ length: 50 }).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('variables_project_key_idx').on(table.projectId, table.key),
  index('variables_key_idx').on(table.key),
  index('variables_project_idx').on(table.projectId),
])

export const variableValues = pgTable('variable_values', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  variableId: bigint({ mode: 'number' }).references(() => variables.id, { onDelete: 'cascade' }).notNull(),
  environmentId: bigint({ mode: 'number' }).references(() => environments.id, { onDelete: 'cascade' }).notNull(),
  value: varchar({ length: 4000 }).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('variable_values_variable_env_idx').on(
    table.variableId,
    table.environmentId
  ),
  index('variable_values_env_idx').on(table.environmentId),
])

export const tokens = pgTable('tokens', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  token: varchar({ length: 800 }).unique().notNull(),
  name: varchar({ length: 25 }).notNull(),
  userId: uuid().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('tokens_token_idx').on(table.token),
  index('tokens_user_idx').on(table.userId)
])

export const environments = pgTable('environments', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 25 }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('environments_team_name_idx').on(table.teamId, table.name),
  index('environments_team_idx').on(table.teamId),
])

export const teamStats = pgTable('team_stats', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  teamId: bigint({ mode: 'number' }).unique().references(() => teams.id, { onDelete: 'set null' }),
  pushCount: integer('push_count').notNull().default(0),
  pullCount: integer('pull_count').notNull().default(0),
  ...timestamps,
}, (table) => [uniqueIndex('team_stats_id_idx').on(table.id)])

export const githubAppRelations = relations(githubApp, ({ one }) => ({
  users: one(user, {
    fields: [githubApp.userId],
    references: [user.id],
  })
}))

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(members),
  projects: many(projects),
  environments: many(environments),
  invitations: many(invitations),
}))

export const membersRelations = relations(members, ({ one }) => ({
  team: one(teams, {
    fields: [members.teamId],
    references: [teams.id],
  }),
  user: one(user, {
    fields: [members.userId],
    references: [user.id],
  })
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(user, {
    fields: [invitations.invitedById],
    references: [user.id],
  })
}))

export const projectsRelations = relations(projects, ({ one }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  })
}))

export const variablesRelations = relations(variables, ({ one, many }) => ({
  project: one(projects, {
    fields: [variables.projectId],
    references: [projects.id],
  }),
  values: many(variableValues)
}))

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(user, {
    fields: [tokens.userId],
    references: [user.id],
  })
}))

export const environmentsRelations = relations(environments, ({ one, many }) => ({
  team: one(teams, {
    fields: [environments.teamId],
    references: [teams.id],
  }),
  values: many(variableValues)
}))

export const variableValuesRelations = relations(variableValues, ({ one }) => ({
  variable: one(variables, {
    fields: [variableValues.variableId],
    references: [variables.id],
  }),
  environment: one(environments, {
    fields: [variableValues.environmentId],
    references: [environments.id],
  })
}))
