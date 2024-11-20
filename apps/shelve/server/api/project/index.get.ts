import { z, zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event) => {
  const query = await zh.useValidatedQuery(event, {
    teamId: z.string({
      required_error: 'Team ID is required',
    }).transform((value) => parseInt(value, 10)),
  })
  return await new ProjectService().getProjectsByTeamId(query.teamId)
})
