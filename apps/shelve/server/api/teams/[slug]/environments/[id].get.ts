import { z } from 'zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { teamWide: false })
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string({ error: 'name is required' }),
  }).parse)

  const environment = await new EnvironmentsService().getEnvironment(id, team.id)
  await requireTokenScope(event, { permission: 'read', environmentId: environment.id })
  return environment
})
