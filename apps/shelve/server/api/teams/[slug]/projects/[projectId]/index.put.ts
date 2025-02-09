import { z } from 'zod'

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
    required_error: 'Project ID is required',
  }).int().positive(),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  const body = await readValidatedBody(event, updateProjectSchema.parse)

  return await new ProjectsService().updateProject({
    id: projectId,
    ...body,
    teamId: team.id
  })
})
