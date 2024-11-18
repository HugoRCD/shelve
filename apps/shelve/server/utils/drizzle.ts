import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../database/schema'

export { sql, eq, and, or, ilike, like, not, inArray } from 'drizzle-orm'

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL
  },
  schema
})

export const tables = schema
