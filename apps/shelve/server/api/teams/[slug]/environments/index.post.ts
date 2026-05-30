import { z } from 'zod'
import { TeamRole } from '@types'

const createEnvironmentSchema = z.object({
  name: z.string().min(3).max(50),
})

export default defineEventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { name } = await readValidatedBody(event, createEnvironmentSchema.parse)

  const environment = await new EnvironmentsService().createEnvironment({ name, teamId: team.id })

  await logAudit(event, {
    teamId: team.id,
    action: 'environment.create',
    resourceType: 'environment',
    resourceId: environment.id,
    metadata: { name: environment.name },
  })

  return {
    statusCode: 201,
    message: 'Environment created',
  }
})
