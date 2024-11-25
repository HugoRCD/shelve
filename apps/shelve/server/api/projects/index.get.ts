import { z, zh } from 'h3-zod'
import { TeamsService } from '~~/server/services/teams'
import { ProjectsService } from '~~/server/services/projects'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  let { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.string().transform((value) => parseInt(value, 10)).optional()
  })

  if (!teamId) teamId = await new TeamsService().getPrivateUserTeamId(user.id)

  return await new ProjectsService().getProjects(teamId, {
    id: user.id,
    role: user.role,
  })
})
