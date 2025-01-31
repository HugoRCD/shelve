import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { timestamps } from './column.helpers'

const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png'
const DEFAULT_LOGO = 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true'

const ROLE_VALUES = ['user', 'admin'] as const
const AUTH_TYPE_VALUES = ['github', 'google'] as const
const TEAM_ROLE_VALUES = ['owner', 'admin', 'member'] as const

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  username: text().unique().notNull(),
  email: text().unique().notNull(),
  avatar: text().notNull().default(DEFAULT_AVATAR),
  role: text({ enum: ROLE_VALUES }).notNull().default('user'),
  authType: text({ enum: AUTH_TYPE_VALUES }).notNull(),
  onboarding: integer({ mode: 'boolean' }).notNull().default(false),
  cliInstalled: integer({ mode: 'boolean' }).notNull().default(false),
  ...timestamps,
})

export const githubApp = sqliteTable('github_app', {
  id: integer().primaryKey({ autoIncrement: true }),
  slug: text().unique().notNull(),
  appId: integer().notNull(),
  privateKey: text().notNull(),
  webhookSecret: text().notNull(),
  clientId: text().notNull(),
  clientSecret: text().notNull(),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const teams = sqliteTable('teams', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().unique().notNull(),
  logo: text().notNull().default(DEFAULT_LOGO),
  ...timestamps,
})

export const members = sqliteTable('members', {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer().notNull().references(() => teams.id, { onDelete: 'cascade' }),
  role: text({ enum: TEAM_ROLE_VALUES }).notNull().default('member'),
  ...timestamps,
})

export const projects = sqliteTable('projects', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  teamId: integer().notNull().references(() => teams.id, { onDelete: 'cascade' }),
  description: text().notNull().default(''),
  repository: text().notNull().default(''),
  projectManager: text().notNull().default(''),
  homepage: text().notNull().default(''),
  variablePrefix: text().notNull().default(''),
  logo: text().notNull().default(DEFAULT_LOGO),
  ...timestamps,
})

export const variables = sqliteTable('variables', {
  id: integer().primaryKey({ autoIncrement: true }),
  projectId: integer().notNull().references(() => projects.id, { onDelete: 'cascade' }),
  key: text().notNull(),
  ...timestamps,
})

export const variableValues = sqliteTable('variable_values', {
  id: integer().primaryKey({ autoIncrement: true }),
  variableId: integer().notNull().references(() => variables.id, { onDelete: 'cascade' }),
  environmentId: integer().notNull().references(() => environments.id, { onDelete: 'cascade' }),
  value: text().notNull(),
  ...timestamps,
})

export const tokens = sqliteTable('tokens', {
  id: integer().primaryKey({ autoIncrement: true }),
  token: text().unique().notNull(),
  name: text().notNull(),
  userId: integer().notNull().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const environments = sqliteTable('environments', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  teamId: integer().notNull().references(() => teams.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const teamStats = sqliteTable('team_stats', {
  id: integer().primaryKey({ autoIncrement: true }),
  teamId: integer().notNull().unique().references(() => teams.id),
  pushCount: integer().notNull().default(0),
  pullCount: integer().notNull().default(0),
  ...timestamps,
})

export const githubAppRelations = relations(githubApp, ({ one }) => ({
  users: one(users, {
    fields: [githubApp.userId],
    references: [users.id],
  })
}))

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
