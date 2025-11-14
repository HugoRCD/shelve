export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const cache = useStorage('cache')
  await cache.clear()
})
