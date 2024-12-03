import { z } from 'zod'
import { ProjectsService } from '~~/server/services/projects'
import { idParamsSchema } from '~~/server/database/zod'

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().trim().optional(),
  homepage: z.string().trim().optional(),
  projectManager: z.string().trim().optional(),
  variablePrefix: z.string().trim().optional(),
  repository: z.string().trim().optional(),
  logo: z.string().trim().optional(),
})

export default eventHandler(async (event) => {
  const team = useTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  const body = await readValidatedBody(event, updateProjectSchema.parse)
  return await new ProjectsService().updateProject({
    id,
    ...body,
    teamId: team.id
  })
})
