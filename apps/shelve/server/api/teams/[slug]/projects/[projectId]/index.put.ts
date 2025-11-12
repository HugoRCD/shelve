import { z } from 'zod'
import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().trim().optional(),
  homepage: z.string().trim().optional(),
  projectManager: z.string().trim().optional(),
  variablePrefix: z.string().trim().optional(),
  repository: z.string().trim().optional(),
  logo: z.string().trim().optional(),
})

const projectIdParamsSchema = z.object({
  projectId: z.coerce.number({
    error: 'Project ID is required',
  }).int().positive(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)

  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  const body = await readValidatedBody(event, updateProjectSchema.parse)

  return await new ProjectsService().updateProject({
    id: projectId,
    ...body,
    teamId: team.id
  })
})
