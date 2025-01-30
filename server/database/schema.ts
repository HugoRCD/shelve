import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { timestamps } from './column.helpers'

const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png'
const DEFAULT_LOGO = 'https://github.com/HugoRCD/shelve/blob/main/assets/default.webp?raw=true'

const ROLE_VALUES = ['USER', 'ADMIN'] as const
const AUTH_TYPE_VALUES = ['GITHUB', 'GOOGLE'] as const
const TEAM_ROLE_VALUES = ['OWNER', 'ADMIN', 'MEMBER'] as const

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  avatar: text('avatar').notNull().default(DEFAULT_AVATAR),
  role: text('role', { enum: ROLE_VALUES }).notNull().default('USER'),
  authType: text('auth_type', { enum: AUTH_TYPE_VALUES }).notNull(),
  onboarding: integer('onboarding', { mode: 'boolean' }).notNull().default(false),
  cliInstalled: integer('cli_installed', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
})

export const githubApp = sqliteTable('github_app', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').unique().notNull(),
  appId: integer('app_id').notNull(),
  privateKey: text('private_key').notNull(),
  webhookSecret: text('webhook_secret').notNull(),
  clientId: text('client_id').notNull(),
  clientSecret: text('client_secret').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logo: text('logo').notNull().default(DEFAULT_LOGO),
  ...timestamps,
})

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  role: text('role', { enum: TEAM_ROLE_VALUES }).notNull().default('MEMBER'),
  ...timestamps,
})

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  description: text('description').notNull().default(''),
  repository: text('repository').notNull().default(''),
  projectManager: text('project_manager').notNull().default(''),
  homepage: text('homepage').notNull().default(''),
  variablePrefix: text('variable_prefix').notNull().default(''),
  logo: text('logo').notNull().default(DEFAULT_LOGO),
  ...timestamps,
})

export const variables = sqliteTable('variables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  ...timestamps,
})

export const variableValues = sqliteTable('variable_values', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  variableId: integer('variable_id').notNull().references(() => variables.id, { onDelete: 'cascade' }),
  environmentId: integer('environment_id').notNull().references(() => environments.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
  ...timestamps,
})

export const tokens = sqliteTable('tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').unique().notNull(),
  name: text('name').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const environments = sqliteTable('environments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const teamStats = sqliteTable('team_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: integer('team_id').notNull().unique().references(() => teams.id),
  pushCount: integer('push_count').notNull().default(0),
  pullCount: integer('pull_count').notNull().default(0),
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
