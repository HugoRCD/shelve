import { H3Event } from 'h3'
import { seal, unseal } from '@shelve/crypto'

const { encryptionKey } = useRuntimeConfig().private
const { siteUrl } = useRuntimeConfig().public

export default defineEventHandler(async (event: H3Event) => {
  const storage = await useStorage('cache')
  const body = await readBody(event)
  const { id } = await getQuery(event)
  // if id -> unseal mode
  if (id) {
    const key = `envshare:${id}`
    const value = await storage.getItem(key)
    if (!value) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
    const decryptedValue = await unseal(value, encryptionKey)
    return {
      decryptedValue,
    }
  }
  // if not id -> seal mode
  const { value, reads, ttl } = body
  const encryptedValue = await seal(value, encryptionKey)
  const randomId = Math.random().toString(36).slice(2)
  const key = `envshare:${randomId}`
  await storage.setItem(key, encryptedValue)
  return `${siteUrl}/envshare?id=${randomId}`
})
