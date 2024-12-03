import { EnvironmentsService } from '~~/server/services/environments'

export default eventHandler(async (event) => {
  const team = useTeam(event)

  return await new EnvironmentsService().getEnvironments(team.id)
})
