import { z } from 'zod'
import { TeamRole } from '@types'

const bulkAssignGroupSchema = z.object({
  variableIds: z.array(z.number().int().positive()).min(1).max(100),
  groupId: z.number().int().positive().nullable(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })
  const { variableIds, groupId } = await readValidatedBody(event, bulkAssignGroupSchema.parse)
  await new VariablesService(event).bulkAssignGroup(variableIds, groupId)
  return {
    statusCode: 200,
    message: 'Variables assigned to group',
  }
})
