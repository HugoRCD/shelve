import { projectIdParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const variablesService = new VariablesService(event)
  variablesService.incrementStatAsync(team.id, 'pull')
  const encryptedVariables = await variablesService.getVariables(projectId)
  if (!encryptedVariables)
    throw createError({ statusCode: 404, statusMessage: 'Project variables not found' })
  return await variablesService.decryptVariables(encryptedVariables)
})
