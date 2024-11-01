import type { H3Event } from 'h3'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'projectId') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing params' })
  const variableService = new VariableService()
  return await variableService.getVariablesByProjectId(+id)
})
