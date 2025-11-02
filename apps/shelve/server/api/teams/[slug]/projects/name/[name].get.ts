import { z } from 'zod'

const getProjectSchema = z.object({
  name: z.string({
    error: 'Project name is required',
  })
    .min(1).max(255).trim()
    .transform((value) => decodeURIComponent(value)),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const { name } = await getValidatedRouterParams(event, getProjectSchema.parse)

  const project = await db.query.projects.findFirst({
    where: and(
      sql`lower(${schema.projects.name}) like lower(${name})`,
      eq(schema.projects.teamId, team.id)
    ),
  })

  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })

  return project
})
