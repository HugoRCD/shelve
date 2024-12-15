import { boolean, integer, pgEnum, pgTable, varchar, index, uniqueIndex, bigint } from 'drizzle-orm/pg-core'
import { AuthType, Role, TeamRole } from '@shelve/types'
import { relations } from 'drizzle-orm'
import { timestamps } from './column.helpers'

const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png'
const DEFAULT_LOGO = 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true'

export const teamRoleEnum = pgEnum('team_role', [
  TeamRole.OWNER,
  TeamRole.ADMIN,
  TeamRole.MEMBER,
])

export const rolesEnum = pgEnum('roles', [
  Role.USER,
  Role.ADMIN,
])

export const authTypesEnum = pgEnum('auth_types', [
  AuthType.GITHUB,
  AuthType.GOOGLE,
])

export const users = pgTable('users', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  username: varchar({ length: 25 }).unique().notNull(),
  email: varchar({ length: 50 }).unique().notNull(),
  avatar: varchar({ length: 500 }).default(DEFAULT_AVATAR).notNull(),
  role: rolesEnum().default(Role.USER).notNull(),
  authType: authTypesEnum().notNull(),
  onboarding: boolean().default(false).notNull(),
  cliInstalled: boolean().default(false).notNull(),
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
  userId: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('members_user_team_idx').on(table.userId, table.teamId),
  index('members_role_idx').on(table.role),
  index('members_team_role_idx').on(table.teamId, table.role)
])

export const projects = pgTable('projects', {
  id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  teamId: bigint({ mode: 'number' }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  description: varchar({ length: 500 }).default('').notNull(),
  repository: varchar({ length: 50 }).default('').notNull(),
  projectManager: varchar({ length: 100 }).default('').notNull(),
  homepage: varchar({ length: 100 }).default('').notNull(),
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
  value: varchar({ length: 800 }).notNull(),
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
  userId: bigint({ mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
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

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(members),
  projects: many(projects),
  environments: many(environments),
}))

export const membersRelations = relations(members, ({ one }) => ({
  team: one(teams, {
    fields: [members.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
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
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
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
