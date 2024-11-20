import { z, zh } from 'h3-zod'
import { TeamService } from '~~/server/services/teams.service'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  let { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.string().transform((value) => parseInt(value, 10)).optional()
  })

  if (!teamId) teamId = (await new TeamService().getPrivateUserTeam(user.id)).id

  return await new ProjectService().getProjectsByTeamId(teamId)
})
