import type { Stats } from '~~/packages/types'

type CachedStats = {
  data: Stats
  timestamp: number
}

export default defineEventHandler(async () => {
  const storage = useStorage('cache')

  const cached = await storage.getItem<CachedStats>(STATS_CACHE_KEY)

  if (cached) {
    const { data: cachedStats, timestamp } = cached
    const isStale = Date.now() - timestamp > STATS_CACHE_REVALIDATE_AFTER

    if (isStale) {
      Promise.resolve().then(async () => {
        try {
          const freshStats = await getStats()
          await storage.setItem(STATS_CACHE_KEY, {
            data: freshStats,
            timestamp: Date.now()
          })
        } catch (error) {
          console.error('Background revalidation failed:', error)
        }
      })
    }

    return cachedStats
  }

  const freshStats = await getStats()

  await storage.setItem(STATS_CACHE_KEY, {
    data: freshStats,
    timestamp: Date.now()
  })

  return freshStats
})
