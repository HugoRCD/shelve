import { TeamRole } from '@types'
import { groupIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const { groupId } = await getValidatedRouterParams(event, groupIdParamsSchema.parse)

  await new VariableGroupsService().getGroupForProject(groupId, project.id)
  await new VariableGroupsService().deleteGroup(groupId)

  return { statusCode: 200, message: 'Variable group deleted successfully' }
})
