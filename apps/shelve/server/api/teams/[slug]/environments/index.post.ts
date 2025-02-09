import { z } from 'zod'
import { TeamRole } from '@types'

const createEnvironmentSchema = z.object({
  name: z.string().min(3).max(50),
})

export default defineEventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { name } = await readValidatedBody(event, createEnvironmentSchema.parse)

  await new EnvironmentsService().createEnvironment({ name, teamId: team.id })

  return {
    statusCode: 201,
    message: 'Environment created',
  }
})
