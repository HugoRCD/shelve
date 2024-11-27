import { z, zh } from 'h3-zod'
import { EnvironmentsService } from '~~/server/services/environments'

export default defineEventHandler(async (event) => {
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Team ID is required',
    }).int().positive(),
  })
  const { name } = await zh.useValidatedBody(event, {
    name: z.string().min(3).max(50),
  })
  const { user } = await requireUserSession(event)

  await new EnvironmentsService().createEnvironment({ name, teamId })

  return {
    statusCode: 201,
    message: 'Environment created',
  }
})
