export const CACHE_TTL = 60 * 60 // 1 hour

export const cacheEntities = {
  Team: {
    prefix: 'team',
    key: 'teamId',
    ttl: CACHE_TTL,
    invalidates: []
  },
  Teams: {
    prefix: 'teams',
    key: 'teamId',
    ttl: CACHE_TTL,
    invalidates: []
  },
  Members: {
    prefix: 'members',
    key: 'teamId',
    ttl: CACHE_TTL,
    invalidates: ['Team', 'Teams']
  },
  Project: {
    prefix: 'project',
    key: 'projectId',
    ttl: CACHE_TTL,
    invalidates: []
  },
  Projects: {
    prefix: 'projects',
    key: 'teamId',
    ttl: CACHE_TTL,
    invalidates: ['Project']
  },
  Variables: {
    prefix: 'variables',
    key: 'projectId',
    ttl: CACHE_TTL,
    invalidates: []
  }
} as const

export function withCache<T>(
  entity: keyof typeof cacheEntities,
  fn: (...args: any[]) => Promise<T>
) {
  return cachedFunction(fn, {
    maxAge: cacheEntities[entity].ttl,
    name: cacheEntities[entity].prefix,
    getKey: (...args: any[]) => `${cacheEntities[entity].key}:${args.join(':')}`
  })
}

export async function clearCache(entity: keyof typeof cacheEntities, ...params: any[]) {
  const storage = useStorage('cache')
  const config = cacheEntities[entity]

  await storage.removeItem(`nitro:functions:${config.prefix}:${params.join(':')}`)

  for (const invalidateEntity of config.invalidates) {
    await clearCache(invalidateEntity, ...params)
  }
}
