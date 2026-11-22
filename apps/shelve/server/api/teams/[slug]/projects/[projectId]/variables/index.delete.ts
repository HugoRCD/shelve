import { z } from 'zod'
import { TeamRole } from '@types'

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { minRole: TeamRole.OWNER })
  const { variables } = await readValidatedBody(event, z.object({
    variables: z.array(z.number()).min(1).max(100),
  }).parse)
  const variablesService = new VariablesService(event)
  const keys = await variablesService.deleteVariablesInProject(project.id, variables)

  await logAudit(event, {
    teamId: team.id,
    action: 'variables.delete',
    resourceType: 'project',
    resourceId: project.id,
    metadata: { projectId: project.id, projectName: project.name, keys },
  })

  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
