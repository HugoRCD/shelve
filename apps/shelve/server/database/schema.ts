import { boolean, integer, pgEnum, pgTable, varchar, unique, uniqueIndex } from 'drizzle-orm/pg-core'
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

export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  logo: text().default('https://github.com/HugoRCD/shelve/blob/main/assets/default.png?raw=true').notNull(),
  private: integer({ mode: 'boolean' }).default(true).notNull(),
  privateOf: integer().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: [TeamRole.OWNER, TeamRole.ADMIN, TeamRole.MEMBER] }).default(TeamRole.MEMBER).notNull(),
  ...timestamps,
})

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  description: varchar().default('').notNull(),
  repository: varchar().default('').notNull(),
  projectManager: varchar().default('').notNull(),
  homepage: varchar().default('').notNull(),
  variablePrefix: varchar().default('').notNull(),
  logo: varchar().default('https://github.com/HugoRCD/shelve/blob/main/assets/default.png?raw=true').notNull(),
  ...timestamps,
})

export const variables = sqliteTable('variables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer().references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  key: varchar().notNull(),
  ...timestamps,
})

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
})

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
