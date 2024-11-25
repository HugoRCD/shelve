import { z, zh } from 'h3-zod'
import { ProjectsService } from '~~/server/services/projects'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Name is required',
    }).min(1).max(255).trim(),
    teamId: z.number({
      required_error: 'Team ID is required',
    }),
    description: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    repository: z.string().trim().optional(),
    projectManager: z.string().trim().optional(),
    homepage: z.string().trim().optional(),
    variablePrefix: z.string().trim().optional(),
  })
  return await new ProjectsService().createProject({
    ...body,
    requester: {
      id: user.id,
      role: user.role,
    }
  })
})
