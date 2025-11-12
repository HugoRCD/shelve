import { z } from 'zod'
import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().trim().optional(),
  logo: z.string().trim().optional(),
  repository: z.string().trim().optional(),
  projectManager: z.string().trim().optional(),
  homepage: z.string().trim().optional(),
  variablePrefix: z.string().trim().optional(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)

  const body = await readValidatedBody(event, createProjectSchema.parse)

  return await new ProjectsService().createProject({
    ...body,
    teamId: team.id,
  })
})
