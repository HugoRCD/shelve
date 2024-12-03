import { TeamRole } from '@shelve/types'
import { idParamsSchema } from '~~/server/database/zod'

export default defineEventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await useDrizzle().delete(tables.environments)
    .where(eq(tables.environments.id, id))

  await clearCache('Team', team.id)

  return {
    statusCode: 204,
    message: 'Environment deleted',
  }
})
