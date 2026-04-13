import { z } from 'zod'
import { TeamRole } from '@types'
import { projectIdParamsSchema } from '~~/server/db/zod'

const createGroupSchema = z.object({
  name: z.string({ error: 'Group name is required' }).min(1).max(50).trim(),
  description: z.string().max(500).trim().optional(),
  position: z.number().int().min(0).optional(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const body = await readValidatedBody(event, createGroupSchema.parse)

  const group = await new VariableGroupsService().createGroup({
    ...body,
    projectId,
  })

  return { statusCode: 201, group }
})
