import { z } from 'zod'

const getEnvironmentsSchema = z.object({
  teamId: z.coerce.number({
    required_error: 'Team ID is required',
  }),
})

export default eventHandler(async (event) => {
  const { teamId } = await getValidatedQuery(event, getEnvironmentsSchema.parse)

  return await new EnvironmentsService().getEnvironments(teamId)
})
