import { TeamRole } from '@types'

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { minRole: TeamRole.OWNER })

  await new ProjectsService().deleteProject(project.id, team.id)

  await logAudit(event, {
    teamId: team.id,
    action: 'project.delete',
    resourceType: 'project',
    resourceId: project.id,
    metadata: { name: project.name },
  })

  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
