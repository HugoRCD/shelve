import { z, zh } from 'h3-zod'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { name } = await zh.useValidatedParams(event, {
    name: z.string({
      required_error: 'Project name is required',
    })
      .min(1).max(255).trim()
      .transform((value) => decodeURIComponent(value)),
  })
  let { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.coerce.number().optional(),
  })

  if (!teamId) teamId = await new TeamsService().getPrivateUserTeamId(user.id)

  const project = await useDrizzle().query.projects.findFirst({
    where: and(ilike(tables.projects.name, name), eq(tables.projects.teamId, teamId)),
  })

  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })

  return project
})
