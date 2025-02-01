type CacheEntity<T = string | number> = {
  prefix: string
  key: string
  ttl: number
  invalidateFor?: (param: T) => Promise<Array<{
    entity: keyof typeof cacheEntities
    param: number | string
  }>>
}

export const CACHE_TTL = 60 * 60 * 8 // 8 hours

export const cacheEntities: Record<string, CacheEntity<string> | CacheEntity<number>> = {
  Team: {
    prefix: 'team',
    key: 'slug',
    ttl: CACHE_TTL,
    invalidateFor: async (id: number | string) => {
      const query = typeof id === 'string' ? eq(tables.teams.slug, id) : eq(tables.teams.id, id)
      const team = await useDrizzle().query.teams.findFirst({
        where: query,
        with: {
          members: {
            columns: { userId: true }
          }
        },
        columns: { id: true, slug: true }
      })
      if (!team) return []
      return team.members.map(member => ({
        entity: 'Teams' as const,
        param: member.userId
      }))
    }
  },
  Teams: {
    prefix: 'teams',
    key: 'userId',
    ttl: CACHE_TTL,
  },
  Environments: {
    prefix: 'environments',
    key: 'teamId',
    ttl: CACHE_TTL,
  },
  Project: {
    prefix: 'project',
    key: 'projectId',
    ttl: CACHE_TTL,
  },
  Projects: {
    prefix: 'projects',
    key: 'teamId',
    ttl: CACHE_TTL,
  },
  Variables: {
    prefix: 'variables',
    key: 'projectId',
    ttl: CACHE_TTL,
  }
} as const

export function withCache<T>(
  entity: keyof typeof cacheEntities,
  fn: (...args: any[]) => Promise<T>
) {
  return cachedFunction(fn, {
    maxAge: cacheEntities[entity].ttl,
    name: cacheEntities[entity].prefix,
    getKey: (arg) => `${cacheEntities[entity].key}:${arg}`
  })
}

export async function clearCache<T extends string | number>(
  entity: keyof typeof cacheEntities,
  id: T
) {
  const storage = useStorage('cache')
  const config = cacheEntities[entity]
  if (!config) throw createError({ statusCode: 404, message: `Cache entity ${entity} not found` })
  const cacheString = `nitro:functions:${config.prefix}:${config.key}:${id}.json`

  await storage.removeItem(cacheString)

  if (config.invalidateFor) {
    const invalidations = await config.invalidateFor(id as never)

    await Promise.all(
      invalidations.map((inv: any) => clearCache(inv.entity, inv.param))
    )
  }
}
