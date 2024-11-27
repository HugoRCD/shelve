import { z, zh } from 'h3-zod'
import { TeamRole } from '@shelve/types'
import { EnvironmentsService } from '~~/server/services/environments'

export default defineEventHandler(async (event) => {
  const { id, teamId } = await zh.useValidatedParams(event, {
    id: z.coerce.number({
      required_error: 'ID is required',
    }).int().positive(),
    teamId: z.coerce.number({
      required_error: 'Team ID is required',
    }).int().positive(),
  })
  const { name } = await zh.useValidatedBody(event, {
    name: z.string().min(3).max(50),
  })
  const { user } = await requireUserSession(event)
  await validateAccess({ teamId, requester: user }, TeamRole.ADMIN)

  await new EnvironmentsService().updateEnvironment({ id, teamId, name })

  return {
    statusCode: 204,
    message: 'Environment updated',
  }
})
