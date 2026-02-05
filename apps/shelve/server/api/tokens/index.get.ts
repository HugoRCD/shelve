import type { Token } from '@types'

export default defineEventHandler(async (event) => {
  const { encryptionKey } = useRuntimeConfig(event).private

  const { user } = await requireAppSession(event)

  const tokens = await db.query.tokens.findMany({
    where: eq(schema.tokens.userId, user.id),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)]
  })

  return Promise.all(tokens.map(async (token): Promise<Token> => ({
    ...token,
    token: await unseal(token.token, encryptionKey) as string
  })))
})
