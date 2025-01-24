import { ProjectsService } from '~~/server/services/projects'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  return await new ProjectsService().getProjects(team.id)
})
