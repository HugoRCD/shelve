import { z } from 'zod'

const createTeamSchema = z.object({
  name: z.string({
    error: 'Cannot create team without name'
  }).min(3).max(50).trim(),
  logo: z.string().optional(),
})

export default eventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  const { name, logo } = await readValidatedBody(event, createTeamSchema.parse)
  return await new TeamsService().createTeam({
    name,
    logo,
    requester: user
  })
})
