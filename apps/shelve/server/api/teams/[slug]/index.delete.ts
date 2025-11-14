import { TeamRole } from '@types'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  await new TeamsService().deleteTeam({ teamId: team.id, slug: team.slug })

  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
