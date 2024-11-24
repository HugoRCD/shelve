export const CACHE_TTL = 60 * 60 * 8 // 8 hours

export const cacheEntities = {
  Team: {
    prefix: 'team',
    key: 'teamId',
    ttl: CACHE_TTL,
  },
  Teams: {
    prefix: 'teams',
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
    getKey: (arg) => {
      console.log('arg', arg)
      return `${cacheEntities[entity].key}:${arg}`
    }
  })
}

export async function clearCache(entity: keyof typeof cacheEntities, param: number) {
  const storage = useStorage('cache')
  const config = cacheEntities[entity]
  const cacheString = `nitro:functions:${config.prefix}:${config.key}:${param}.json`

  await storage.removeItem(cacheString)
}
