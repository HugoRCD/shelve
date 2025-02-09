import { z } from 'zod'

const createTeamSchema = z.object({
  name: z.string({
    required_error: 'Cannot create team without name'
  }).min(3).max(50).trim(),
  logo: z.string().optional(),
})

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { name, logo } = await readValidatedBody(event, createTeamSchema.parse)
  return await new TeamsService().createTeam({
    name,
    logo,
    requester: user
  })
})
