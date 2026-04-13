import { TeamRole } from '@types'
import { projectIdParamsSchema, groupIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })
  await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const { groupId } = await getValidatedRouterParams(event, groupIdParamsSchema.parse)

  await new VariableGroupsService().deleteGroup(groupId)

  return { statusCode: 200, message: 'Variable group deleted successfully' }
})
