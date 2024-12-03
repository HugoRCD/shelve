import { z } from 'zod'
import { TeamRole } from '@shelve/types'
import { EnvironmentsService } from '~~/server/services/environments'
import { idParamsSchema } from '~~/server/database/zod'

const updateEnvironmentSchema = z.object({
  name: z.string().min(3).max(50),
})

export default defineEventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { name } = await readValidatedBody(event, updateEnvironmentSchema.parse)

  await new EnvironmentsService().updateEnvironment({ id, teamId: team.id, name })

  return {
    statusCode: 204,
    message: 'Environment updated',
  }
})
