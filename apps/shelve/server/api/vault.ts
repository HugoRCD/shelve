import type { H3Event } from 'h3'
import { VaultService } from '~~/server/services/vault.service'

export default defineEventHandler(async (event: H3Event) => {
  const vault = new VaultService()
  const { id } = await getQuery(event)

  if (id) return vault.decrypt(id)

  const body = await readBody(event)
  return vault.encrypt(body)
})
