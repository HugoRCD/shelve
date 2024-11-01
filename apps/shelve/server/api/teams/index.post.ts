import type { H3Event } from 'h3'
import type { CreateTeamInput } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const createTeamInput = await readBody(event) as CreateTeamInput
  if (!createTeamInput.name) throw createError({ statusCode: 400, statusMessage: 'Cannot create team without name' })
  const teamService = new TeamService()
  createTeamInput.name = createTeamInput.name.trim()
  return await teamService.createTeam(createTeamInput, user.id)
})
