import { z, zh } from 'h3-zod'
import { ProjectsService } from '~~/server/services/projects'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Project name is required',
    }).min(1).max(255).trim(),
    description: z.string().optional(),
    homepage: z.string().optional(),
    projectManager: z.string().optional(),
    variablePrefix: z.string().optional(),
    repository: z.string().optional(),
    logo: z.string().optional(),
    teamId: z.number({
      required_error: 'Team ID is required',
    }).positive(),
  })
  return await new ProjectsService().updateProject({
    id,
    name: body.name,
    description: body.description,
    homepage: body.homepage,
    projectManager: body.projectManager,
    variablePrefix: body.variablePrefix,
    repository: body.repository,
    logo: body.logo,
    teamId: body.teamId,
    requester: {
      id: user.id,
      role: user.role,
    }
  })
})
