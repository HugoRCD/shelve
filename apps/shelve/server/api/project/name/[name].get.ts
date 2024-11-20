import { z, zh } from 'h3-zod'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  console.log('Hello')
  const { user } = await requireUserSession(event)
  const { name } = await zh.useValidatedParams(event, {
    name: z.string({
      required_error: 'Project name is required',
    })
      .min(1).max(255).trim()
      .transform((value) => decodeURIComponent(value)),
  })
  let { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.string().transform((value) => parseInt(value, 10)),
  })
  console.log('teamId', teamId)

  if (!teamId) teamId = (await new TeamService().getPrivateUserTeam(user.id)).id

  const project = await db.query.projects.findFirst({
    where: and(ilike(tables.projects.name, name), eq(tables.projects.teamId, teamId)),
  })
  console.log(project)

  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })

  return project
})
