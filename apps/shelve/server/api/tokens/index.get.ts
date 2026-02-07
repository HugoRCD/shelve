import type { Token } from '@types'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { encryptionKey } = useRuntimeConfig(event).private

  const { user } = await requireAppSession(event)

  const tokens = await db.query.tokens.findMany({
    where: eq(schema.tokens.userId, user.id),
    orderBy: [desc(schema.tokens.createdAt)]
  })

  return Promise.all(tokens.map(async (token: Token): Promise<Token> => {
    try {
      return {
        ...token,
        token: await unseal(token.token, encryptionKey) as string
      }
    } catch {
      return {
        ...token,
        token: ''
      }
    }
  }))
})
