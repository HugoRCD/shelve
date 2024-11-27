import { z, zh } from 'h3-zod'
import { TeamRole } from '@shelve/types'

export default defineEventHandler(async (event) => {
  const { id, teamId } = await zh.useValidatedParams(event, {
    id: z.coerce.number({
      required_error: 'ID is required',
    }).int().positive(),
    teamId: z.coerce.number({
      required_error: 'Team ID is required',
    }).int().positive(),
  })
  const { user } = await requireUserSession(event)
  await validateAccess({ teamId, requester: user }, TeamRole.ADMIN)

  await useDrizzle().delete(tables.environments)
    .where(eq(tables.environments.id, id))

  await clearCache('Team', teamId)

  return {
    statusCode: 204,
    message: 'Environment deleted',
  }
})
