import { z, zh } from 'h3-zod'
import { ProjectsService } from '~~/server/services/projects'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Name is required',
    }).min(1).max(255).trim(),
    description: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    repository: z.string().trim().optional(),
    projectManager: z.string().trim().optional(),
    homepage: z.string().trim().optional(),
    variablePrefix: z.string().trim().optional(),
  })
  const query = await zh.useValidatedQuery(event, z.object({
    teamId: z.coerce.number().optional()
  }))
  if (!query.teamId) query.teamId = await new TeamsService().getPrivateUserTeamId(user.id)
  return await new ProjectsService().createProject({
    ...body,
    teamId: query.teamId,
    requester: user
  })
})
