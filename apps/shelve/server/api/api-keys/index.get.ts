import type { ApiKey } from '@types'

export default defineEventHandler(async (event): Promise<ApiKey[]> => {
  const { user } = await requireAuth(event)

  return db.query.apiKeys.findMany({
    where: eq(schema.apiKeys.referenceId, user.id),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
    columns: {
      id: true,
      name: true,
      start: true,
      scopes: true,
      allowedCidrs: true,
      expiresAt: true,
      lastRequest: true,
      lastUsedIp: true,
      createdAt: true,
      updatedAt: true,
      referenceId: true,
    },
  })
})
