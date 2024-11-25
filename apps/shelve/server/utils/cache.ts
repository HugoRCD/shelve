type InvalidateFor = {
  entity: keyof typeof cacheEntities
  param: number
}

type CacheEntity = {
  prefix: string
  key: string
  ttl: number
  invalidateFor?: (param: number) => Promise<InvalidateFor[]>
}

export const CACHE_TTL = 60 * 60 * 8 // 8 hours

export const cacheEntities: Record<string, CacheEntity> = {
  Team: {
    prefix: 'team',
    key: 'teamId',
    ttl: CACHE_TTL,
    invalidateFor: async (teamId: number) => {
      const members = await useDrizzle().query.members.findMany({
        where: eq(tables.members.teamId, teamId),
        columns: { userId: true }
      })
      return members.map(member => ({
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

export async function clearCache(entity: keyof typeof cacheEntities, id: number) {
  const storage = useStorage('cache')
  const config = cacheEntities[entity]
  if (!config) throw new Error(`Entity ${entity} not found in cacheEntities`)
  const cacheString = `nitro:functions:${config.prefix}:${config.key}:${id}.json`

  await storage.removeItem(cacheString)

  if (config.invalidateFor) {
    const invalidations = await config.invalidateFor(id)

    await Promise.all(
      invalidations.map((inv: any) => clearCache(inv.entity, inv.param))
    )
  }
}
