import { z } from 'zod'
import { TeamRole } from '@types'

const bulkAssignGroupSchema = z.object({
  variableIds: z.array(z.number().int().positive()).min(1).max(100),
  groupId: z.number().int().positive().nullable(),
})

export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const { variableIds, groupId } = await readValidatedBody(event, bulkAssignGroupSchema.parse)
  if (groupId !== null) {
    await new VariableGroupsService().getGroupForProject(groupId, project.id)
  }
  await new VariablesService(event).bulkAssignGroup(project.id, variableIds, groupId)
  return {
    statusCode: 200,
    message: 'Variables assigned to group',
  }
})
