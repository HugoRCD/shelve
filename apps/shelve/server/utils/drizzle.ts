import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../../schema'
import * as authSchema from '../../auth-schema'

export { sql, eq, and, or, ilike, like, not, inArray, asc, desc } from 'drizzle-orm'

export function useDrizzle() {
  return drizzle({
    connection: {
      connectionString: process.env.DATABASE_URL
    },
    schema
  })
}

export const tables = schema
