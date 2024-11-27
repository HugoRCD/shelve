import { z, zh } from 'h3-zod'
import { ProjectsService } from '~~/server/services/projects'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Name is required',
    }).min(1).max(255).trim(),
    teamId: z.number().nullable(),
    description: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    repository: z.string().trim().optional(),
    projectManager: z.string().trim().optional(),
    homepage: z.string().trim().optional(),
    variablePrefix: z.string().trim().optional(),
  })
  if (!body.teamId) body.teamId = await new TeamsService().getPrivateUserTeamId(user.id)
  return await new ProjectsService().createProject({
    ...body,
    requester: user
  })
})
