import { text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const timestamps = {
  updatedAt: text().notNull().$defaultFn(() => sql`(current_timestamp)`).$onUpdateFn(() => sql`(current_timestamp)`),
  createdAt: text().notNull().$defaultFn(() => sql`(current_timestamp)`),
}
