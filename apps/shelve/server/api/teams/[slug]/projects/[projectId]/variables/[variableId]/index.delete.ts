import { TeamRole } from '@types'
import { variableIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)

  await new VariablesService(event).deleteVariable(variableId)

  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
