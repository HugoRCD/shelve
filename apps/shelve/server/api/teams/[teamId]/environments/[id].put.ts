import { z } from 'zod'
import { EnvironmentsService } from '~~/server/services/environments'
import { idParamsSchema } from '~~/server/database/zod'

const updateEnvironmentSchema = z.object({
  name: z.string().min(3).max(50),
})

export default defineEventHandler(async (event) => {
  const team = useTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { name } = await readValidatedBody(event, updateEnvironmentSchema.parse)

  await new EnvironmentsService().updateEnvironment({ id, teamId: team.id, name })

  return {
    statusCode: 204,
    message: 'Environment updated',
  }
})
