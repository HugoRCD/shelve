import { z } from 'zod'
import { TeamRole } from '@types'

const createGroupSchema = z.object({
  name: z.string({ error: 'Group name is required' }).min(1).max(50).trim(),
  description: z.string().max(500).trim().optional(),
  position: z.number().int().min(0).optional(),
})

export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const body = await readValidatedBody(event, createGroupSchema.parse)

  const group = await new VariableGroupsService().createGroup({
    ...body,
    projectId: project.id,
  })

  return { statusCode: 201, group }
})
