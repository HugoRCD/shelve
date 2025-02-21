import { z } from 'zod'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string({ required_error: 'name is required' }),
  }).parse)

  return await new EnvironmentsService().getEnvironment(id, team.id)
})
