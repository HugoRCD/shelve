import { integer, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { AuthType, Role } from '@shelve/types'
import { timestamps } from '../column.helpers'

export const rolesEnum = pgEnum('roles', [Role.USER, Role.ADMIN])
export const authTypesEnum = pgEnum('auth_types', [AuthType.GITHUB, AuthType.GOOGLE])

export const users = pgTable('users', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  username: varchar().notNull(),
  email: varchar().notNull(),
  avatar: varchar().default('https://i.imgur.com/6VBx3io.png').notNull(),
  role: rolesEnum().default(Role.USER).notNull(),
  authType: authTypesEnum().notNull(),
  ...timestamps,
})

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatar: z.string(),
  role: z.enum([Role.USER, Role.ADMIN]),
  authType: z.enum([AuthType.GITHUB, AuthType.GOOGLE]),
  createdAt: z.date(),
  updatedAt: z.date(),
})
