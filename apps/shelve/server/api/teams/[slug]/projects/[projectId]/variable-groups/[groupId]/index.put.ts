import { z } from 'zod'
import { TeamRole } from '@types'
import { groupIdParamsSchema } from '~~/server/db/zod'

const updateGroupSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  description: z.string().max(500).trim().optional(),
  position: z.number().int().min(0).optional(),
})

export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const { groupId } = await getValidatedRouterParams(event, groupIdParamsSchema.parse)
  const body = await readValidatedBody(event, updateGroupSchema.parse)

  const group = await new VariableGroupsService().updateGroup({
    id: groupId,
    ...body,
  }, project.id)

  return { statusCode: 200, group }
})
