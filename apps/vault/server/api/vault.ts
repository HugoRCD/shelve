import type { DecryptRequest } from '@types'
import { VaultService } from '~~/server/services/vault.service'

export default defineEventHandler(async (event) => {
  const vault = new VaultService(event)
  const { id } = getQuery(event)

  if (id) {
    const body = await readBody<DecryptRequest>(event).catch(() => ({}))
    return vault.decrypt(id as string, body)
  }

  const body = await readBody(event)
  return vault.encrypt(body)
})
