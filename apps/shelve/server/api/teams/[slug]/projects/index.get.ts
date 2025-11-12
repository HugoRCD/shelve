import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  return await new ProjectsService().getProjects(team.id)
})
