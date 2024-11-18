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
  private: boolean().default(true).notNull(),
  ...timestamps,
})

export const members = pgTable('members', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer().references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum().default(TeamRole.MEMBER).notNull(),
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
  members: many(members)
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

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  })
}))

