import { text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const timestamps = {
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(current_timestamp)`).$onUpdateFn(() => sql`(current_timestamp)`),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(current_timestamp)`),
}
