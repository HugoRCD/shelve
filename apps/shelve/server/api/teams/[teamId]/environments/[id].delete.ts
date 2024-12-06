import { idParamsSchema } from '~~/server/database/zod'

export default defineEventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await useDrizzle().delete(tables.environments)
    .where(eq(tables.environments.id, id))

  await clearCache('Environments', team.id)

  return {
    statusCode: 204,
    message: 'Environment deleted',
  }
})
