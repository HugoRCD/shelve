import { z, zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event) => {
  const { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.string().transform((value) => parseInt(value, 10))
  })

  return await new ProjectService().getProjectsByTeamId(teamId)
})
