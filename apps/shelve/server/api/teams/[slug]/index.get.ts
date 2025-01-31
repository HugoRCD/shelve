import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  return await new TeamsService().getTeam(team.slug)
})
