import { H3Event } from 'h3'
import type { CreateTeamInput } from '@shelve/types'
import { createTeam } from '~~/server/app/teamsService'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const createTeamInput = await readBody(event) as CreateTeamInput
  if (!createTeamInput.name) throw createError({ statusCode: 400, statusMessage: 'Cannot create team without name' })
  createTeamInput.name = createTeamInput.name.trim()
  return await createTeam(createTeamInput, user.id)
})
