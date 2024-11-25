import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return new TeamsService().getTeams(user.id)
})
