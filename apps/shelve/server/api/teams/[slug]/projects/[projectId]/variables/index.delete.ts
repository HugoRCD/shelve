import { z } from 'zod'
import { TeamRole } from '@types'

export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event, { minRole: TeamRole.OWNER })
  const { variables } = await readValidatedBody(event, z.object({
    variables: z.array(z.number()).min(1).max(100),
  }).parse)
  const variablesService = new VariablesService(event)
  await variablesService.deleteVariablesInProject(project.id, variables)
  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
