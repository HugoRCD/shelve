import { text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const timestamps = {
  createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
}
