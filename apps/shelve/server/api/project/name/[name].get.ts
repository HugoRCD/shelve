import { z, zh } from 'h3-zod'

export default eventHandler(async (event) => {
  const { name } = await zh.useValidatedParams(event, {
    name: z.string({
      required_error: 'Project name is required',
    })
      .min(1).max(255).trim()
      .transform((value) => decodeURIComponent(value)),
  })
  const { user } = event.context
  const project = await db.query.projects.findFirst({
    where: ilike(tables.projects.name, name),
  })

  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })

  return project
})
