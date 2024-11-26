import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  updatedAt: timestamp().notNull().$onUpdate(() => new Date()),
  createdAt: timestamp().defaultNow().notNull(),
}
