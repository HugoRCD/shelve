import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  if (import.meta.dev) return

  const storage = useStorage()

  const driver = redisDriver({
    base: 'redis',
    url: useRuntimeConfig().private.redis.url,
  })

  storage.mount('vault', driver)
})
