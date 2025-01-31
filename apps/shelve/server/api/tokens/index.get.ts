import type { Token } from '@types'

export default defineEventHandler(async (event) => {
  const { encryptionKey } = useRuntimeConfig(event).private

  const { user } = await requireUserSession(event)

  const tokens = await useDrizzle().query.tokens.findMany({
    where: eq(tables.tokens.userId, user.id),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)]
  })

  return Promise.all(tokens.map(async (token): Promise<Token> => ({
    ...token,
    token: await unseal(token.token, encryptionKey) as string
  })))
})
