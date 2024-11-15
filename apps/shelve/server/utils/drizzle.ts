import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../database'

export { sql, eq, and, or } from 'drizzle-orm'

export const db = drizzle(process.env.DATABASE_URL as string)
export const tables = schema
