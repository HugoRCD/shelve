import { boolean, integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core'
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
  username: varchar().notNull(),
  email: varchar().notNull(),
  avatar: varchar().default('https://i.imgur.com/6VBx3io.png').notNull(),
  role: rolesEnum().default(Role.USER).notNull(),
  authType: authTypesEnum().notNull(),
  ...timestamps,
})

export const teams = pgTable('teams', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  logo: varchar().default('https://github.com/HugoRCD/shelve/blob/main/assets/default.png?raw=true').notNull(),
  private: boolean().default(true).notNull(),
  privateOf: integer().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const members = pgTable('members', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
  ...timestamps,
})

export const projects = pgTable('projects', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  description: varchar(),
  repository: varchar(),
  projectManager: varchar(),
  homepage: varchar(),
  variablePrefix: varchar(),
  logo: varchar(),
  ...timestamps,
})

export const variables = pgTable('variables', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  projectId: integer().references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  key: varchar().notNull(),
  value: varchar().notNull(),
  environment: varchar().notNull(),
  ...timestamps,
})

export const tokens = pgTable('tokens', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  token: varchar().notNull(),
  name: varchar().notNull(),
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

