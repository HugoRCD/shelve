import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../database/schema'

export { sql, eq, and, or, ilike, like, not, inArray, asc, desc } from 'drizzle-orm'

export function useDrizzle() {
  const hyperdrive = process.env.POSTGRES as Hyperdrive | undefined
  const dbUrl = process.env.NUXT_POSTGRES_URL
  if (!dbUrl) {
    throw createError('Missing `POSTGRES` hyperdrive binding or `NUXT_POSTGRES_URL` env variable')
  }
  return drizzle(dbUrl, { schema })
}

export const tables = schema
