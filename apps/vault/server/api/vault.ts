import type { DecryptRequest } from '@types'
import { VaultService } from '~~/server/services/vault.service'
import { SHARE_ID_PATTERN, encryptRequestSchema } from '~~/server/utils/vault'

export default defineEventHandler(async (event) => {
  const vault = new VaultService(event)
  const { id } = getQuery(event)

  if (id !== undefined) {
    if (typeof id !== 'string' || !SHARE_ID_PATTERN.test(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid id or link has expired'
      })
    }
    const body = await readBody<DecryptRequest>(event).catch(() => ({}))
    return vault.decrypt(id, body)
  }

  const body = await readValidatedBody(event, encryptRequestSchema.parse)
  return vault.encrypt(body)
})
