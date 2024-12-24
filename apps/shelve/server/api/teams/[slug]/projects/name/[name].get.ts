import { z } from 'zod'

const getProjectSchema = z.object({
  name: z.string({
    required_error: 'Project name is required',
  })
    .min(1).max(255).trim()
    .transform((value) => decodeURIComponent(value)),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const { name } = await getValidatedRouterParams(event, getProjectSchema.parse)

  const project = await useDrizzle().query.projects.findFirst({
    where: and(ilike(tables.projects.name, name), eq(tables.projects.teamId, team.id)),
  })

  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })

  return project
})
