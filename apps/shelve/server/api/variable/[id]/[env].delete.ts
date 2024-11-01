import type { H3Event } from 'h3'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id') as string
  const env = getRouterParam(event, 'env') as string
  if (!id && !env) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const variableService = new VariableService()
  await variableService.deleteVariable(+id, env)
  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
