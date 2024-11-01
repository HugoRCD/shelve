import type { Environment } from '@shelve/types'
import type { H3Event } from 'h3'
import { getVariablesByProjectId } from '~~/server/services/variable.service'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id') as string
  const env = getRouterParam(event, 'env') as Environment
  if (!id && !env) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  return await getVariablesByProjectId(parseInt(id), env)
})
