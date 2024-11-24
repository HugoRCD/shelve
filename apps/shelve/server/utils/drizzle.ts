import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export { sql, eq, and, or, ilike, like, not, inArray } from 'drizzle-orm'

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export const tables = schema

export function seal(secret: any, password: string) {
  return secret
}

export function unseal(secret: any, password: string) {
  return secret
}
