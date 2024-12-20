import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  const driver = redisDriver({
    base: 'redis',
    url: useRuntimeConfig().private.redis.url,
  })

  storage.mount('vault', driver)
})
