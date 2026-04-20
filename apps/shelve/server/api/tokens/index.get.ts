import type { Token } from '@types'

export default defineEventHandler(async (event): Promise<Token[]> => {
  const { user } = await requireUserSession(event)

  return db.query.tokens.findMany({
    where: eq(schema.tokens.userId, user.id),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)],
    columns: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      allowedCidrs: true,
      expiresAt: true,
      lastUsedAt: true,
      lastUsedIp: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  })
})
