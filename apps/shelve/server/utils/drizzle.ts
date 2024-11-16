import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../database/schema'

export { sql, eq, and, or } from 'drizzle-orm'

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL
  },
  schema
})

export const tables = schema
