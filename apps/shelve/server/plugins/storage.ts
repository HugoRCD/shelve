import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(async () => {
  if (import.meta.env.NODE_ENV === 'development') return
  const storage = useStorage()
  await storage.unmount('cache')

  const driver = redisDriver({
    base: 'redis',
    url: useRuntimeConfig().private.redis.url,
  })

  storage.mount('cache', driver)
})
