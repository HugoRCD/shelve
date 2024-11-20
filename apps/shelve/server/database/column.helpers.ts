import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  updatedAt: timestamp().defaultNow().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
}
