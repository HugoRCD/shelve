import { boolean, integer, pgEnum, pgTable, varchar, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { AuthType, Role, TeamRole } from '@shelve/types'
import { relations } from 'drizzle-orm'
import { timestamps } from './column.helpers'

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
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  username: varchar().unique().notNull(),
  email: varchar().unique().notNull(),
  avatar: varchar().default('https://i.imgur.com/6VBx3io.png').notNull(),
  role: rolesEnum().default(Role.USER).notNull(),
  authType: authTypesEnum().notNull(),
  ...timestamps,
})

export const teams = pgTable('teams', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  logo: varchar().default('https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true').notNull(),
  private: boolean().default(true).notNull(),
  privateOf: integer().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
}, (table) => [index('teams_private_of_idx').on(table.privateOf)])

export const members = pgTable('members', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('members_user_team_idx').on(table.userId, table.teamId),
  index('members_role_idx').on(table.role),
  index('members_team_role_idx').on(table.teamId, table.role)
])

export const projects = pgTable('projects', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  description: varchar().default('').notNull(),
  repository: varchar().default('').notNull(),
  projectManager: varchar().default('').notNull(),
  homepage: varchar().default('').notNull(),
  variablePrefix: varchar().default('').notNull(),
  logo: varchar().default('https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true').notNull(),
  ...timestamps,
})

export const variables = pgTable('variables', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  projectId: integer().references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  key: varchar().notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('variables_project_key_idx').on(table.projectId, table.key),
  index('variables_key_idx').on(table.key)
])

export const variableValues = pgTable('variable_values', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  variableId: integer().references(() => variables.id, { onDelete: 'cascade' }).notNull(),
  environmentId: integer().references(() => environments.id, { onDelete: 'cascade' }).notNull(),
  value: varchar().notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('variable_values_variable_env_idx').on(
    table.variableId,
    table.environmentId
  )
])

export const tokens = pgTable('tokens', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  token: varchar().notNull(),
  name: varchar().notNull(),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ...timestamps,
})

export const environments = pgTable('environments', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
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
