import { variableIdParamsSchema } from '~~/server/database/zod'

import { getTeamSlugFromEvent, requireUserTeam, TeamRole } from '~~/server/utils/auth'

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
