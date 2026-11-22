import { idParamsSchema } from '~~/server/db/zod'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { user } = await requireAuth(event)
  const [deletedApiKey] = await db.delete(schema.apiKeys)
    .where(
      and(
        eq(schema.apiKeys.id, id),
        eq(schema.apiKeys.referenceId, user.id)
      )
    )
    .returning()

  if (!deletedApiKey) throw createError({ statusCode: 404, message: `API key not found with id ${id}` })

  const teamIds = await resolveTeamIdsFromApiKeyScopes(deletedApiKey.scopes, user.id)

  await logAuditForTeams(event, teamIds, {
    action: 'token.delete',
    resourceType: 'token',
    resourceId: deletedApiKey.id,
    metadata: { name: deletedApiKey.name, prefix: deletedApiKey.start },
  })

  return deletedApiKey
})
