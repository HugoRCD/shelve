import { EnvironmentsService } from '~~/server/services/environments'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  return await new EnvironmentsService().getEnvironments(team.id)
})
