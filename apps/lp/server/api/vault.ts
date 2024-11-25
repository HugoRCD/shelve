import { VaultService } from '~~/server/services/vault.service'

export default defineEventHandler(async (event) => {
  const vault = new VaultService(event)
  const { id } = getQuery(event)

  if (id) return vault.decrypt(id as string)

  const body = await readBody(event)
  return vault.encrypt(body)
})
