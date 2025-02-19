export default defineEventHandler(async () => {
  const cache = useStorage('cache')
  await cache.clear()
})
