import { AuthType, Role, TeamRole } from '@shelve/types'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { timestamps } from './column.helpers'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  email: text().notNull(),
  avatar: text().default('https://i.imgur.com/6VBx3io.png').notNull(),
  role: text('role', { enum: [Role.USER, Role.ADMIN] }).default(Role.USER).notNull(),
  authType: text('authType', { enum: [AuthType.GITHUB, AuthType.GOOGLE] }).notNull(),
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
  description: text(),
  repository: text(),
  projectManager: text(),
  homepage: text(),
  variablePrefix: text(),
  logo: text(),
  ...timestamps,
})

export const variables = sqliteTable('variables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer().references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  key: text().notNull(),
  value: text().notNull(),
  environment: text().notNull(),
  ...timestamps,
})

export const tokens = sqliteTable('tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text().notNull(),
  name: text().notNull(),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ...timestamps,
})

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(members),
  projects: many(projects),
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

export const variablesRelations = relations(variables, ({ one }) => ({
  project: one(projects, {
    fields: [variables.projectId],
    references: [projects.id],
  })
}))

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  })
}))
