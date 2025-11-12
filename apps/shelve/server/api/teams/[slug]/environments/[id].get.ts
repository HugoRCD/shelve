import { z } from 'zod'

import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string({ error: 'name is required' }),
  }).parse)

  return await new EnvironmentsService().getEnvironment(id, team.id)
})
