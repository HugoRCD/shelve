import { VaultService } from '~~/server/services/vault.service'

export default defineEventHandler(async (event) => {
  const vault = new VaultService()
  const { id } = await getQuery(event)

  if (id) return vault.decrypt(id)

  const body = await readBody(event)
  return vault.encrypt(body)
})
