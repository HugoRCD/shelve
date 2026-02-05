import { boolean, pgEnum, pgTable, varchar, index, uniqueIndex, bigint, integer, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { schema as authSchema } from 'hub:db'
import { TeamRole, InvitationStatus } from '../../../../packages/types'

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
  userId: uuid().references(() => authSchema.user.id, { onDelete: 'cascade' }).notNull(),
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
  userId: uuid().references(() => authSchema.user.id, { onDelete: 'cascade' }).notNull(),
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
  email: varchar({ length: 50 }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
  token: varchar({ length: 64 }).unique().notNull(),
  status: invitationStatusEnum().default(InvitationStatus.PENDING).notNull(),
  invitedById: uuid().references(() => authSchema.user.id, { onDelete: 'set null' }),
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
  userId: uuid().references(() => authSchema.user.id, { onDelete: 'cascade' }).notNull(),
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
  users: one(authSchema.user, {
    fields: [githubApp.userId],
    references: [authSchema.user.id],
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
  user: one(authSchema.user, {
    fields: [members.userId],
    references: [authSchema.user.id],
  })
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(authSchema.user, {
    fields: [invitations.invitedById],
    references: [authSchema.user.id],
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
  user: one(authSchema.user, {
    fields: [tokens.userId],
    references: [authSchema.user.id],
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
